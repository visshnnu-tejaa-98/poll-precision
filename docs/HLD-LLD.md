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

## 5.2 Save Response — planned write pipeline (❌ not built)

This is the next feature. Contract and steps:

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

## 5.4 Realtime-on-write (planned design decision)

A Server Action and the `io` server live in the same process but different modules.
Two options to push live counts after a save:

- **(A)** In `server.js`, assign `globalThis.io = io`; the action calls
  `globalThis.io?.to(pollId).emit("poll:results", counts)`.
- **(B)** Client emits `response:submitted` after the action resolves; the socket
  server recomputes/broadcasts. Simpler, recommended first.

---

# 6. How We RETRIEVE Data for Analytics (planned)

## 6.1 Aggregations (❌ dashboard currently hardcoded)

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

## 6.2 Public results view (❌)

When `isPublished` (results) + `resultsVisibility`, `/poll/[id]` should render a
read-only summary instead of the form. Guard the results action by these flags.

---

# 7. Realtime (LLD)

## 7.1 Server (`server.js`)

```
io.on("connection", socket => {
  socket.emit("message", "Hello from server");         // greeting
  socket.on("message", d => socket.emit("message", `Echo: ${d}`)); // echo demo
  socket.on("select:option", d => console.log(d));     // vote signal (not persisted)
});
```

## 7.2 Client singleton (`socket.js`)

```
export const socketInstance = io({ autoConnect: false }); // connect controlled by provider
```

## 7.3 Provider (`app/utils/SocketProvider.tsx`)

- Mounted in `poll/[id]/layout.tsx` (ancestor of page + form — a Provider must be
  above every `useSocket()` consumer).
- Effect attaches `connect`/`disconnect`/`message` listeners **then** calls
  `connect()` (so one-shot server emits aren't missed), and `off()`+`disconnect()`
  on cleanup.
- Exposes `{ socket, isConnected, transport, lastMessage }` via context.

## 7.4 Event contract (current + planned)

| Event                | Dir      | Payload                  | Purpose                  |
| -------------------- | -------- | ------------------------ | ------------------------ |
| `message`            | S→C, C→S | string                   | greeting/echo (demo)     |
| `select:option`      | C→S      | `{questionId, optionId}` | live selection signal ✅ |
| `poll:results`       | S→C      | counts map               | live analytics ❌        |
| `response:submitted` | C→S      | `{pollId}`               | trigger recompute ❌     |

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

## 8.3 Submit response (❌ planned)

```
User → PollResponseForm: select options, Submit
Form → Form: required check (client)
Form → submitPollResponse(payload): Server Action
action → prisma.poll.findUnique(include questions/options)
action → guards: published/active/expiry/auth-mode
action → validate: required + option membership
action → prisma.$transaction: create Response + Answers
action → Form: { responseId } | error
Form → thank-you screen ; (optional) socket "response:submitted"
server → dashboards: "poll:results" broadcast
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

| Area                                     | State          | Action item                                       |
| ---------------------------------------- | -------------- | ------------------------------------------------- |
| Response persistence                     | ❌             | `app/actions/response.ts` + `ResponseInputSchema` |
| Backend required/expiry/auth enforcement | ❌             | in `submitPollResponse`                           |
| Analytics                                | ❌ (hardcoded) | `getPollResults` + dashboard wiring               |
| Publish results view                     | ❌             | conditional `/poll/[id]` render + guards          |
| Live counts                              | ⚠️ infra only  | `poll:results` broadcast (§5.4)                   |
| Draft save / EXPIRED transition          | ❌             | builder draft + status job/check                  |
| "Express APIs" (PRD wording)             | deviation      | implemented as Server Actions                     |
| README                                   | ❌             | replace boilerplate                               |

```




Phase 1 — Persist a response (the immediate goal)

Step 1 — Response validation schema
- New app/(main)/builder/zod.schema.ts sibling (or app/actions/response.schema.ts): ResponseInputSchema = { pollId: string, answers: { questionId, optionId }[] }.

Step 2 — submitPollResponse server action (app/actions/response.ts)
- validate(ResponseInputSchema, payload).
- Load poll from DB with questions + options.
- Guards (server-side, authoritative): exists, isPublished, status === ACTIVE, not past expiresAt.
- Resolve respondent via currentUser() (optional): enforce authenticatedOnly; set respondentId / isAnonymous.
- Backend validation: all required questions answered; every questionId/optionId belongs to the poll.
- prisma.$transaction: create Response + Answers.
- Catch the @@unique([pollId, respondentId]) collision → "already responded".

Step 3 — Wire the form to the action
- Pass pollId into PollResponseForm.
- Make handleSubmit async: call the action, add submitting state + inline error, show thank-you only on real success.
Phase 2 — Live counts + analytics

Step 4 — getPollResults(pollId) via answer.groupBy + response.count.
Step 5 — Broadcast poll:results after the transaction commits (decide globalThis.io vs. client-triggered recompute — recommend client-triggered first).
Step 6 — Replace the hardcoded dashboard stats with real data + subscribe to poll:results.

Phase 3 — Results publishing & lifecycle

Step 7 — Public results view on /poll/[id] when isPublished + resultsVisibility.
Step 8 — Draft save + EXPIRED status transition.
Step 9 — Replace the boilerplate README.
```
