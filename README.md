# Poll Precision

A full-stack polling platform. Signed-in users create polls, share a public link,
and collect single-choice responses — anonymously or from authenticated users —
with expiry enforcement, a live analytics dashboard, publishable public results,
and **real-time response counts over WebSockets**.

---

## Features

- **Poll builder** — title, description, multiple questions, per-question
  required/optional flag, single-option answers. Save as a **draft** or publish.
- **Response modes** — anonymous or authenticated-only, enforced on the server.
- **Expiry** — each poll can have an expiry time; once past it, responses are
  rejected (server-side) and the poll reads as closed.
- **Validation on both sides** — Zod schemas run in the browser (for UX) and again
  in every Server Action (for trust). Option/question membership is re-checked
  against the DB copy of the poll to prevent tampering.
- **One response per user** — enforced by a `@@unique(pollId, respondentId)`
  constraint; anonymous responses are allowed multiple times. Editing a response
  is opt-in per poll.
- **Analytics dashboard** — total responses, anonymous count, per-question option
  counts + percentages, and a 14-day participation timeline.
- **Publishable results** — the creator can expose results; anyone visiting the
  same poll link then sees a read-only summary.
- **Real-time** — when a response is submitted, the server broadcasts
  `poll:results` to everyone viewing that poll; the analytics page and the public
  results view re-fetch live, with no refresh.

## Tech stack

| Layer      | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19)                         |
| Backend    | Server Actions (RPC-style) — no hand-written REST routes  |
| Realtime   | Socket.IO 4, attached to a custom Node server             |
| Auth       | Clerk (`@clerk/nextjs`)                                    |
| Database   | Postgres (Neon) via Prisma 7 + Neon serverless adapter    |
| Validation | Zod 4                                                     |
| Styling    | Tailwind CSS v4                                            |

> **Note on "Express APIs":** the backend is implemented with Next.js **Server
> Actions** (each `"use server"` export is an RPC endpoint invoked over POST)
> rather than an Express router. This is a deliberate deviation — the trust
> boundary, validation, and auth checks all live at the Server Action entry.

## Architecture

Next.js and the Socket.IO server run in **one Node process** (`server.js`) on port
3000 — a custom server is required because Socket.IO needs a raw `http.Server` to
attach to. Because they share a process, a Server Action can reach the same `io`
instance in-process (`globalThis.io`) and broadcast after a DB write.

```
Browser (React 19) ──HTTP/RSC/Server Actions──┐
       │                                        ├─► server.js ─► Next.js App Router ─► Prisma ─► Neon Postgres
       └──────────────WebSocket────────────────┘            └─► Socket.IO (rooms per pollId)
                                                                   ▲
                                     submitPollResponse() ─────────┘  emits poll:results
```

Full design notes (data model, read/write paths, sequence diagrams, trust
boundaries) live in [`docs/HLD-LLD.md`](docs/HLD-LLD.md).

## Getting started

### Prerequisites

- Node.js 20+
- A Postgres database (a [Neon](https://neon.tech) connection string works out of
  the box with the configured adapter)
- A [Clerk](https://clerk.com) application (publishable + secret keys)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgres://...
```

### 3. Set up the database

```bash
npm run db:migrate   # apply migrations
npm run db:generate  # generate the Prisma client
```

### 4. Run

```bash
npm run dev          # node server.js — Next + Socket.IO on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start Next.js + Socket.IO (custom server)     |
| `npm run build`       | Production build                              |
| `npm start`           | Start the production server                   |
| `npm run lint`        | ESLint                                        |
| `npm run db:migrate`  | Run Prisma migrations                         |
| `npm run db:generate` | Generate the Prisma client                    |
| `npm run db:studio`   | Open Prisma Studio                            |

## Project structure

```
app/
  (landing)/            Marketing pages
  (main)/               Authenticated app (dashboard, builder, analytics, my polls…)
    builder/            Poll builder + Zod schemas
    analytics/[pollId]/ Creator analytics (live via LiveResults)
  poll/[id]/            Public poll page (respond / live results)
  actions/              Server Actions — the backend (poll.ts, response.ts, …)
  lib/                  Prisma client (db.ts), realtime broadcast helper
  utils/                Socket provider, auth helper, poll-status, constants
prisma/                 schema.prisma + migrations
server.js               Custom Next + Socket.IO server
```

## Security

- The Server Action entry is the trust boundary — all browser input (including
  socket payloads) is untrusted and re-validated server-side.
- Expiry and auth-mode are enforced on the server; client checks are UX only.
- `getPollById` / `getPublicPollResults` only return published polls and omit
  owner-only fields.
- Keep `.env` out of version control and rotate keys if leaked.
