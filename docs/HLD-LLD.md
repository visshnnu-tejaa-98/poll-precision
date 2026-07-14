# Poll Precision — HLD & LLD

> Full-stack polling platform: create polls, share a public link, collect
> (anonymous or authenticated) responses, view analytics, and publish results,
> with real-time updates over WebSockets.

Legend: ✅ implemented · ⚠️ partial · ❌ planned (not built yet)

---

# 1. High-Level Design (HLD)

## 1.1 Context diagram

```
                         ┌──────────────────────────────────────────┐
                         │            Custom Node server             │
                         │              (server.js)                  │
  ┌───────────┐  HTTP    │  ┌───────────────┐    ┌────────────────┐  │
  │  Browser  │◄────────►│  │  Next.js 16   │    │  Socket.IO     │  │
  │ (React 19)│  RSC/    │  │  App Router   │    │  server        │  │
  │           │  Actions │  │  + Server     │    │  (same port)   │  │
  │           │◄────────►│  │  Actions      │    └────────────────┘  │
  └───────────┘  WS      │  └──────┬────────┘                        │
                         └─────────┼─────────────────────────────────┘
                                   │ Prisma (Neon serverless adapter)
                                   ▼
                         ┌───────────────────┐        ┌──────────────┐
                         │  Neon Postgres    │        │   Clerk      │
                         │  (polls, users,   │        │  (auth /     │
                         │   responses…)     │        │   identity)  │
                         └───────────────────┘        └──────────────┘
```

**Key property:** Next and Socket.IO run **in one Node process** (`server.js`) on
port 3000. `npm run dev` = `node server.js` (not `next dev`). This matters: it
means a Server Action _could_ reach the same `io` instance in-process (see §5.4).

## 1.2 Logical components

| Component       | Tech                     | Role                                               |
| --------------- | ------------------------ | -------------------------------------------------- |
| Web client      | React 19, Tailwind v4    | Rendering, forms, socket subscription              |
| App server      | Next.js 16 App Router    | RSC rendering + Server Actions (the "backend")     |
| Realtime server | Socket.IO 4              | Live events (option selection, future live counts) |
| Auth            | Clerk (`@clerk/nextjs`)  | Identity, session, middleware (`proxy.ts`)         |
| ORM / DB        | Prisma 7 + Neon Postgres | Persistence                                        |
| Validation      | Zod 4                    | Input contracts on the server boundary             |

## 1.3 Runtime topology & why

- **Server Actions as the backend (RPC-style), not REST.** Each `"use server"`
  export is an RPC endpoint invoked from the client via POST. No hand-written
  controllers/routes.
- **Custom server** is required because Socket.IO needs a raw `http.Server` to
  attach to; Next's default dev server doesn't expose one.
- **Prisma singleton** avoids exhausting Neon connections during dev HMR.

## 1.4 Cross-cutting concerns

- **AuthN/Z:** `proxy.ts` runs `clerkMiddleware()` on all non-static routes.
  `(main)/layout.tsx` calls `getCurrentLoggedInUser()` (throws if unauthenticated →
  effectively protects the dashboard/builder). `/poll/[id]` is public.
- **Validation:** `validate(schema, payload)` runs Zod `safeParseAsync`; on failure
  throws `ValidationError(400, fieldErrors)`.
- **Error model:** `ApiError` hierarchy (`ValidationError`, `NotFoundError`,
  `UnauthorizedError`, …). Actions currently catch/log and rethrow generic `Error`.
- **Serialization:** data crossing the Server Action → client boundary must be
  serializable. `Date` is converted to ISO strings where consumed on the client
  (e.g. `getAllPollsByUserId` maps `createdAt.toISOString()`).

---

# 2. Data Model (LLD)

## 2.1 Entities, columns, constraints

```
User
  id           String  @id @default(cuid())
  clerkUserId  String                 // link to Clerk identity
  email        String  @unique        // upsert key
  firstName    String
  lastName     String
  polls        Poll[]
  createdAt    DateTime @default(now())

Poll
  id                   String  @id @default(cuid())
  title                String
  description          String?
  creatorId            String  ─┐ FK → User.id
  creator              User    ─┘
  expiresAt            DateTime?
  status               PollStatus @default(ACTIVE)   // DRAFT | ACTIVE | EXPIRED
  allowAnonymous       Boolean @default(true)
  authenticatedOnly    Boolean @default(false)
  resultsVisibility    Boolean @default(false)       // ⚠️ currently unused
  isPublished          Boolean @default(false)
  allowResponseEditing Boolean @default(false)
  responseTimer        Boolean
  timerInMinutes       Int
  questions            Question[]
  responses            Response[]
  createdAt/updatedAt  DateTime

Question
  id          String  @id @default(cuid())
  pollId      String  ─┐ FK → Poll.id
  poll        Poll    ─┘
  title       String
  isRequired  Boolean @default(false)
  order       Int
  options     QuestionOption[]
  answers     Answer[]

QuestionOption
  id          String  @id
  questionId  String  ─┐ FK → Question.id
  question    Question─┘
  text        String
  answers     Answer[]

Response
  id            String  @id
  pollId        String  ─┐ FK → Poll.id
  poll          Poll    ─┘
  respondentId  String?               // User.id when authed, NULL when anonymous
  isAnonymous   Boolean
  answers       Answer[]
  submittedAt   DateTime @default(now())
  @@unique([pollId, respondentId])     // 1 response/user; multiple NULLs allowed (anon)

Answer
  id          String  @id
  responseId  String  ─┐ FK → Response.id
  questionId  String  ─┐ FK → Question.id
  optionId    String  ─┐ FK → QuestionOption.id
```

## 2.2 Constraint semantics that drive logic

- `User.email @unique` → the upsert key in `getCurrentLoggedInUser`.
- `Response @@unique([pollId, respondentId])`:
  - Authenticated: enforces **one response per user per poll** (2nd insert → unique violation).
  - Anonymous: `respondentId = NULL`; Postgres treats NULLs as **distinct**, so
    many anonymous responses are allowed by default.
- No cascade deletes are declared (deleting a poll with children would fail on FKs).

## 2.3 Relationships (cardinality)

```
User 1───N Poll 1───N Question 1───N QuestionOption
                 │                          │
                 1                          │ (optionId)
                 │                          ▼
                 N                     Answer  N───1 Question (questionId)
              Response 1───N Answer
```

---

# 3. Data Access Layer (LLD)

## 3.1 Prisma client (`app/lib/db.ts`)

```ts
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- Uses the **Neon serverless driver adapter** (WebSocket/HTTP to Neon), not TCP.
- Cached on `globalThis` in dev so HMR reuses one client.
- Client is **generated into `app/generated/prisma`** (checked into the repo) and
  imported via `@/app/generated/prisma/client`.

## 3.2 Where queries live

All DB access is inside `"use server"` actions (`app/actions/*`). Components never
touch Prisma directly. This keeps the DB on the server and gives one validation +
auth choke point.

---

# 4. How We GET Data (retrieval mechanics)

There are **three distinct read paths** in this app:

### 4.1 Server Component read (preferred, SSR)

Used by the dashboard. The RSC awaits an action directly during render:

```
DashboardOverviewPage (server component)
  └─ await getAllPollsByUserId()          // runs on server, in-process
       └─ getCurrentLoggedInUser()        // Clerk → DB upsert
       └─ prisma.poll.findMany({ where:{creator:{clerkUserId}}, select:{…} })
       └─ map createdAt → ISO string      // serialization for client table
  → HTML streamed to browser
```

- No network round-trip for the query itself (same process).
- **Serialization rule:** returned objects are embedded in the RSC payload, so
  `Date`/`Decimal`/etc. must be converted (here `createdAt.toISOString()`).

### 4.2 Client Component read (via Server Action as RPC)

Used by the public poll page (it is a client component so it can host the socket):

```
PublicPollPage ("use client")
  ├─ const { id } = use(params)                       // unwrap route param Promise
  └─ useEffect([id]) → getPollById(id)                // Server Action = POST under the hood
        server: prisma.poll.findFirst({ where:{id, isPublished:true}, select:{…nested} })
     → setPoll(data) | setPoll(null) | finally setLoading(false)
```

- The action is imported into the client bundle as a **reference**; calling it
  issues a POST to the Next server, which runs the function and returns JSON.
- **Query shaping:** `select` returns only public-safe fields (no `creatorId`,
  no unpublished polls) and orders questions by `order`, options nested.
- ⚠️ Pitfall handled earlier: this must NOT be an `async` client component
  (caused an infinite Server Action loop). Data is fetched in an effect instead.

### 4.3 Realtime read (Socket.IO push)

Live values arrive via socket events, surfaced through `SocketProvider` context
(`isConnected`, `transport`, `lastMessage`). See §7.

### 4.4 Type derivation

Client code derives types from the action's return so the shape stays in sync:

```ts
type Poll = NonNullable<Awaited<ReturnType<typeof getPollById>>>;
```

---

# 5. How We SAVE Data (write mechanics)

## 5.1 Create poll — the implemented write pipeline

```
PollBuilder (client state: title, description, questions[], settings, advanced)
  │  handlePublish()
  │    1. PollInputSchema.safeParse(rawData)      // FRONTEND validation → toast on error
  │    2. savePoll(rawData)                        // Server Action (RPC/POST)
  ▼
savePoll(payload: unknown)                          [server]
  │    3. validate(PollInputSchema, payload)        // BACKEND validation (re-check)
  │    4. saveNewPoll(data, publish=true)
  ▼
saveNewPoll                                          [server]
  │    5. getCurrentLoggedInUser()                  // resolve creator (Clerk→DB upsert)
  │    6. prisma.poll.create({ data:{ …flags, creatorId,
  │           questions:{ create:[{…, options:{ create:[…] }}] } } })   // NESTED write
  │    7. return { success:true, pollId }
  ▼
PublishSuccessModal shows  <origin>/poll/<pollId>
```

Notes:

- **Nested create** writes Poll + Questions + Options in a single Prisma call
  (implicitly transactional).
- `expiresAt` is transformed in the schema: `""`|null → `null`, else `new Date()`.
- Validation runs **twice** (client for UX, server for trust). Never trust the client.

## 5.2 Save Response — implemented write pipeline (✅ `app/actions/response.ts`)

Contract and steps (as built):

```
ResponseInputSchema = {
  pollId: string,
  answers: { questionId: string; optionId: string }[]
}

submitPollResponse(payload) [server, "use server"]:
  1. data = validate(ResponseInputSchema, payload)
  2. poll = prisma.poll.findUnique({ where:{id}, include:{ questions:{ include:{ options:true } } } })
     - reject if !poll || !isPublished || status !== ACTIVE
     - reject if expiresAt && expiresAt <= now         // EXPIRY ENFORCEMENT (backend)
  3. user = await currentUser()   // OPTIONAL (not getCurrentLoggedInUser, which throws)
     - if poll.authenticatedOnly && !user → UnauthorizedError
     - respondentId = user ? dbUser.id : null;  isAnonymous = !user
  4. Backend validation:
     - every REQUIRED question has an answer
     - every answer.questionId ∈ poll.questions
     - every answer.optionId ∈ that question's options   // anti-tamper
  5. prisma.$transaction:
     - create Response { pollId, respondentId, isAnonymous }
     - createMany Answer[] { responseId, questionId, optionId }
     - (if allowResponseEditing and existing response → update instead)
  6. Handle @@unique([pollId, respondentId]) violation → "already responded"
  7. return { success:true, responseId }

PollResponseForm.handleSubmit → await submitPollResponse(...) →
  submitting state + inline error; on success show thank-you screen;
  optionally emit socket event so dashboards update (see §5.4).
```

## 5.3 Transaction & integrity rules

- Use `prisma.$transaction` so a `Response` never exists without its `Answer`s.
- Validate option/question membership against the **DB copy** of the poll, not the
  payload, to prevent injecting foreign option ids.

## 5.4 Realtime-on-write (✅ implemented — internal relay bridge)

**Gotcha discovered:** the "obvious" approach — `globalThis.io = io` in `server.js`,
then `globalThis.io?.to(room).emit(...)` from the action — **does not work here.**
Next.js (Turbopack) runs Server Actions in a **different module/global context**
than the custom `server.js` process, so `globalThis.io` is `undefined` inside the
action. Verified empirically (a debug route reported `ioPresent: false` while a
relayed broadcast still reached the client).

**What we do instead:** the Next side opens one persistent internal
`socket.io-client` connection back to our own server and asks it to relay:

```
submitPollResponse() [server action]
  └─ broadcastPollResults(pollId)      → emit "internal:relay" { token, room:pollId, event:"poll:results" }
  └─ broadcastCreatorUpdate(clerkId)   → emit "internal:relay" { token, room:`creator:<id>`, event:"creator:update" }

server.js  socket.on("internal:relay", ({token,room,event,payload}) =>
             token === RELAY_TOKEN && io.to(room).emit(event, payload))
```

- `app/lib/realtime.ts` holds the internal emitter singleton + the two helpers.
- The relay is guarded by a shared `SOCKET_RELAY_TOKEN` so only our own server
  code can trigger a broadcast.
- Clients re-fetch the authoritative aggregate (Server Action) on the event rather
  than trusting counts pushed over the socket.

---

# 6. How We RETRIEVE Data for Analytics (✅ implemented)

## 6.1 Aggregations (✅ `getPollAnalytics` / `getPublicPollResults`)

```
getPollResults(pollId) [server]:
  - total responses:  prisma.response.count({ where:{ pollId } })
  - per-option counts: prisma.answer.groupBy({
        by:['questionId','optionId'],
        where:{ response:{ pollId } },
        _count:{ _all:true } })
  - participation: responses / (expected or unique respondents)
  → shape into { questionId → { optionId → count } } for the UI
```

## 6.2 Public results view (✅)

When `isPublished` + `resultsVisibility`, `/poll/[id]` renders a read-only summary
(`PollResults`) instead of the form — shown after the visitor submits, if they've
already responded, or once the poll is closed. `getPublicPollResults` returns
`null` unless `resultsVisibility` is on, so results stay private until published.

---

# 7. Realtime (LLD)

## 7.1 Server (`server.js`)

```
io.on("connection", socket => {
  socket.on("join:poll",    id  => socket.join(id));            // poll results room
  socket.on("leave:poll",   id  => socket.leave(id));
  socket.on("join:creator", cid => socket.join(`creator:${cid}`)); // creator aggregates room
  socket.on("leave:creator",cid => socket.leave(`creator:${cid}`));
  socket.on("internal:relay", ({token,room,event,payload}) =>   // Server-Action bridge (§5.4)
    token === RELAY_TOKEN && io.to(room).emit(event, payload));
});
```

(The original `message`/`Echo`/`select:option` demo handlers have been removed.)

## 7.2 Client singleton (`socket.js`)

```
export const socketInstance = io({ autoConnect: false }); // connect controlled by provider
```

## 7.3 Provider (`app/utils/SocketProvider.tsx`)

- Mounted in `poll/[id]/layout.tsx` (ancestor of page + form — a Provider must be
  above every `useSocket()` consumer).
- Effect attaches `connect`/`disconnect` listeners, calls `connect()`, and
  `off()`+`disconnect()` on cleanup.
- Exposes `{ socket, isConnected }` via context.
- The creator pages (dashboard/my-polls/reports/submissions) are **not** under
  this provider; `CreatorLiveRefresh` drives the shared `socketInstance` directly
  and calls `router.refresh()` on `creator:update`.

## 7.4 Event contract (implemented)

| Event             | Dir | Payload              | Purpose                                             |
| ----------------- | --- | -------------------- | --------------------------------------------------- |
| `join:poll`       | C→S | `pollId`             | join a poll's results room ✅                       |
| `leave:poll`      | C→S | `pollId`             | leave it ✅                                         |
| `join:creator`    | C→S | `clerkUserId`        | join a creator's cross-poll aggregates room ✅      |
| `leave:creator`   | C→S | `clerkUserId`        | leave it ✅                                         |
| `poll:results`    | S→C | `{pollId}`           | poll's results changed → client re-fetches ✅       |
| `creator:update`  | S→C | `{}`                 | a creator's poll changed → `router.refresh()` ✅    |
| `internal:relay`  | C→S | `{token,room,event}` | Server-Action→io bridge, token-guarded (§5.4) ✅    |

---

# 8. Sequence Diagrams

## 8.1 Create & publish poll (✅)

```
User → PollBuilder: fill form, click Publish
PollBuilder → PollBuilder: PollInputSchema.safeParse (client)
PollBuilder → savePoll(raw): Server Action (POST)
savePoll → validate: PollInputSchema (server)
savePoll → saveNewPoll → getCurrentLoggedInUser → prisma.poll.create(nested)
saveNewPoll → PollBuilder: { pollId }
PollBuilder → PublishSuccessModal: show /poll/<id> link
```

## 8.2 View public poll (✅)

```
Browser → /poll/[id] (client): use(params) → id
Layout → SocketProvider: connect()
page effect → getPollById(id): Server Action
getPollById → prisma.poll.findFirst(published, nested select)
page → render: loading → (form | closed | not-found)
```

## 8.3 Submit response (✅)

```
User → PollResponseForm: select options, Submit
Form → Form: required check (client)
Form → submitPollResponse(payload): Server Action
action → prisma.poll.findUnique(include questions/options)
action → guards: published/active/expiry/auth-mode
action → validate: required + option membership
action → prisma.$transaction: create Response + Answers
action → broadcastPollResults(pollId) + broadcastCreatorUpdate(creator.clerkUserId)  // via internal:relay (§5.4)
action → Form: { responseId } | error
Form → thank-you / live results screen
server → poll room: "poll:results" ; creator room: "creator:update"
```

---

# 9. Security & Trust Boundaries

- **Trust boundary = the Server Action entry.** Everything from the browser
  (including socket payloads) is untrusted.
- Re-validate all response input server-side; verify option/question membership
  against DB, not payload.
- Enforce expiry + auth-mode server-side (client `isClosed` is UX only).
- `getPollById` only returns `isPublished` polls and omits owner-only fields.
- **Secrets:** `.env` holds `CLERK_SECRET_KEY` + Neon URL — must stay gitignored;
  rotate if leaked.

---

# 10. Known Gaps / Deviations (traceability)

| Area                                     | State       | Notes                                                            |
| ---------------------------------------- | ----------- | ---------------------------------------------------------------- |
| Response persistence                     | ✅          | `app/actions/response.ts` + `ResponseInputSchema`                |
| Backend required/expiry/auth enforcement | ✅          | in `submitPollResponse`                                          |
| Analytics                                | ✅          | `getPollAnalytics` / `getPublicPollResults` (real aggregates)    |
| Publish results view                     | ✅          | conditional `/poll/[id]` render, guarded by `resultsVisibility`  |
| Live counts / analytics                  | ✅          | `poll:results` + `creator:update` via internal relay (§5.4)      |
| Draft save                               | ⚠️ partial  | can save a draft, but no `builder/[id]` flow to resume/publish it |
| Edit / delete poll                       | ❌          | no update/delete action; schema has no cascade deletes           |
| Live updates for paged/filtered tables   | ❌          | cards + first page refresh; deeper table rows don't              |
| EXPIRED transition                       | ✅ (derived)| computed at read time (`poll-status.ts`), not persisted          |
| "Express APIs" (PRD wording)             | deviation   | implemented as Server Actions                                    |
| README                                   | ✅          | rewritten                                                        |
| Deployment / deployed link               | ❌          | needs a persistent-Node host (custom server + Socket.IO)         |

# 11. Remaining work

Phases 1–3 of the original build plan (persist responses, live counts + analytics,
results publishing, draft save, README) are **done**. What's left:

1. **Deployment** — add a deploy config and ship to a persistent-Node host (the
   custom `server.js` + Socket.IO can't run on plain serverless).
2. **Resumable drafts** — a `builder/[id]` flow to reopen a saved draft and
   publish it (DRAFT → ACTIVE). Today "Save Draft" is write-only.
3. **Edit / delete poll** — update/delete actions, plus `onDelete: Cascade` on the
   `Question` / `QuestionOption` / `Response` / `Answer` relations so a poll can be
   removed without FK errors.
4. **Live updates for paged/filtered tables** — currently only stat cards and each
   table's first page refresh live.
