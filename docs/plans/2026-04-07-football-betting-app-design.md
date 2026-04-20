# Football Betting App — Implementation Design

**Date**: 2026-04-07  
**Status**: Approved  
**Scope**: Private group football betting web app for a small group of friends

---

## Overview

A full-stack web application where a group admin creates football tournaments, adds games, and users bet on results. Points are automatically awarded when the admin enters actual results. A per-tournament leaderboard tracks scores.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack monorepo — React UI + API routes in one project, ideal for Vercel |
| Language | TypeScript | End-to-end type safety |
| Database | Neon (serverless Postgres) | Free tier, zero-config on Vercel via Vercel Postgres integration |
| ORM | Prisma | Type-safe queries, schema-first migrations |
| Auth | Auth.js v5 (NextAuth) | Credentials provider (email + bcrypt password), session cookies |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible, consistent UI components |
| Deployment | Vercel | Single project, automatic deploys from git |

> **Why Next.js monorepo over separate React SPA + API?**  
> For a small friend group app, one Vercel project is simpler: shared TypeScript types across UI and API, no CORS configuration, and fewer moving parts. The React frontend is still standard React — it lives in `app/` as server and client components.

---

## Environments

Development uses a **local Postgres** (Docker) as the test database; production uses **Neon** on Vercel. Same Prisma schema and migrations; only `DATABASE_URL` and related env vars differ.

### Local development

- **Database**: Postgres in Docker via `docker-compose.yml` at the repo root (`postgres:16-alpine`).
- **Env file**: `.env.local` — set `DATABASE_URL` to the local instance (see table below).
- **Run**: `docker compose up -d` then `npm run dev` (Next.js dev server on `http://localhost:3000`).
- **Migrations**: `prisma migrate dev` applies migrations to the local DB only.
- **Seed**: `prisma db seed` (via `prisma/seed.ts`) loads a test admin user, one group, one tournament, and a couple of games for manual testing.

### Production (Vercel + Neon)

- **Database**: Neon serverless Postgres, connected through Vercel (e.g. Vercel Postgres integration or Neon dashboard connection string).
- **Env**: Set in the Vercel project: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (production URL).
- **Migrations**: `prisma migrate deploy` in the production build (not `migrate dev`).
- **Docker**: `docker-compose.yml` is for local use only; it is not run on Vercel.

### Environment configuration

| Location | Used when | `DATABASE_URL` target |
|---|---|---|
| `.env.local` | `npm run dev` (local) | Docker Postgres (`localhost:5432`) |
| Vercel environment variables | Production deploy | Neon serverless Postgres |

Additional env vars required for push notifications:

| Variable | Where to set | Notes |
|---|---|---|
| `VAPID_PUBLIC_KEY` | `.env.local` + Vercel | Generated once via `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | `.env.local` + Vercel | Keep secret — never expose to the client |
| `VAPID_SUBJECT` | `.env.local` + Vercel | `mailto:admin@yourapp.com` |
| `CRON_SECRET` | `.env.local` + Vercel | Protects the cron endpoint; Vercel injects it automatically for cron invocations |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `.env.local` + Vercel | Public key exposed to the browser for push subscription |

### Example `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: typer_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

Example local URL: `postgresql://postgres:postgres@localhost:5432/typer_dev`

---

## Application Structure

```
typer-2/
├── app/
│   ├── (auth)/
│   │   ├── login/                  # Login page
│   │   └── register/               # Registration page
│   ├── (app)/                      # Protected routes (require auth)
│   │   ├── layout.tsx              # Shared nav, session provider
│   │   ├── dashboard/              # Upcoming games + bet submission
│   │   ├── tournaments/
│   │   │   ├── page.tsx            # List all tournaments (+ "Add tournament" button for admins)
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Games list for a tournament (+ "Add game" button for admins)
│   │   │       └── leaderboard/    # Tournament-specific leaderboard
│   └── api/
│       ├── auth/[...nextauth]/     # Auth.js handler
│       ├── bets/                   # POST/PUT bet
│       ├── games/
│       │   ├── route.ts            # POST create game (admin only)
│       │   └── [id]/
│       │       ├── route.ts        # PUT update game (admin only)
│       │       └── result/         # POST actual result (admin only)
│       ├── tournaments/
│       │   ├── route.ts            # POST create tournament (admin only)
│       │   └── [id]/
│       │       └── route.ts        # PUT update tournament (admin only)
│       ├── groups/
│       │   ├── route.ts            # POST create group (admin only)
│       │   └── [id]/
│       │       ├── route.ts        # PUT update group (admin only)
│       │       └── members/
│       │           └── route.ts    # POST add member by email (admin only)
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── BetForm.tsx
│   ├── GameCard.tsx
│   ├── Leaderboard.tsx
│   └── TournamentCard.tsx
├── lib/
│   ├── auth.ts                     # Auth.js config
│   ├── db.ts                       # Prisma client singleton
│   ├── scoring.ts                  # Point calculation logic
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # Dev/test data (admin user, group, tournament, games)
├── docker-compose.yml              # Local Postgres only (not used in production)
├── proxy.ts                        # Route protection (Auth.js; Next.js 16)
├── tailwind.config.ts
└── package.json
```

---

## Database Schema (Prisma)

> Full schema with ER diagram and constraint notes: [docs/database-schema.md](../database-schema.md)

### Entities at a glance

| Model | Purpose |
|---|---|
| `User` | Registered user — email, hashed password, name |
| `Group` | A circle of friends sharing tournaments |
| `GroupMember` | Join table — links users to groups, tracks admin flag |
| `Tournament` | A competition (e.g. World Cup 2026) belonging to a group |
| `ScoringRule` | Points config per tournament (exact score pts, correct outcome pts) |
| `Game` | A match with teams, kickoff time, and optional result scores |
| `Bet` | A user's predicted score for a game, with awarded points once result is known |
| `PushSubscription` | Browser push subscription (endpoint + VAPID keys) per user device |

---

## Auth & Group Access

### Registration & Login
- Users register with email + password; password stored as bcrypt hash
- Auth.js Credentials provider validates credentials and issues a session cookie
- `proxy.ts` protects app routes (e.g. `/dashboard`) — unauthenticated users are redirected to `/login`

### Add Member Flow
1. Admin calls `POST /api/groups/[id]/members` with body `{ "email": "user@example.com" }`
2. API looks up the `User` by email — returns **404** if not found (user must register first)
3. If found, creates a `GroupMember` row (`isAdmin: false` by default)
4. Returns **409** if the user is already a member of this group

**Endpoint contract**

```
POST /api/groups/:id/members
Authorization: must be admin of group :id
Body: { "email": "user@example.com" }

200 → { groupMember: { id, userId, groupId, isAdmin: false } }
404 → user with that email not registered
409 → user already a member of this group
403 → caller is not an admin of this group
```

### Admin Role
- The creator of a group is automatically an admin (`GroupMember.isAdmin = true`)
- Admin-only routes/API handlers check `GroupMember.isAdmin` for the current session user

---

## Scoring Logic

Implemented in `lib/scoring.ts`, called when admin POSTs a result to `/api/games/[id]/result`.

```
function calculatePoints(bet, actualResult, scoringRule):
  if bet.homeScore === actual.homeScore && bet.awayScore === actual.awayScore:
    return scoringRule.exactScorePoints          // e.g. 3
  elif outcome(bet) === outcome(actual):          // home win / draw / away win match
    return scoringRule.correctOutcomePoints      // e.g. 1
  else:
    return 0

outcome(score):
  if score.home > score.away → "HOME_WIN"
  if score.home < score.away → "AWAY_WIN"
  else → "DRAW"
```

When a result is entered:
1. Validate user is admin of the tournament's group
2. Update `Game.homeScore` and `Game.awayScore`
3. Fetch all `Bet` rows for the game
4. For each bet, calculate and write `pointsAwarded`
5. This is done in a single Prisma transaction

---

## Leaderboard

The leaderboard is a grouped sum query:

```sql
SELECT u.name, SUM(b.pointsAwarded) AS totalPoints
FROM Bet b
JOIN User u ON b.userId = u.id
JOIN Game g ON b.gameId = g.id
JOIN Tournament t ON g.tournamentId = t.id
WHERE t.groupId = :groupId
  AND t.id = :tournamentId
  AND b.pointsAwarded IS NOT NULL
GROUP BY u.id
ORDER BY totalPoints DESC
```

Exposed as a Next.js Server Component (no separate API route needed) — data fetched server-side at render time.

---

## Key Business Rules

| Rule | Implementation |
|---|---|
| Bets locked after kickoff | API checks `game.kickoffAt < now()` and rejects updates |
| One bet per user per game | `@@unique([gameId, userId])` in Prisma + upsert on submit |
| Only admin can enter results | Middleware check on `GroupMember.isAdmin` |
| Points calculated once | If `Game.homeScore` is already set, re-entry is blocked (or requires explicit override) |
| Users only see their group's data | All queries are scoped to `groupId` derived from session |

---

## High-Level Implementation Plan (for AI agents)

Execute the following phases in order. Each phase should be fully working before proceeding to the next.

### Phase 1 — Project Scaffold

**Status**: Implemented.

- Init Next.js 15 with TypeScript and App Router: `npx create-next-app@latest`
- Install and configure: Tailwind CSS, shadcn/ui (init), Prisma, `@prisma/client`, `@auth/nextjs`, `bcryptjs`, `@types/bcryptjs`
- Set up ESLint: ensure `eslint` and `eslint-config-next` are installed (included by `create-next-app`); extend the config in `eslint.config.mjs` with any project-specific rules (e.g. `@typescript-eslint` recommended rules); add `"lint": "next lint"` script to `package.json`; verify `npm run lint` passes on the fresh scaffold
- Add `docker-compose.yml` (local Postgres); start with `docker compose up -d`
- Add `DATABASE_URL` in `.env.local` pointing at local Docker Postgres (see [Environments](#environments)); run `prisma init`
- Apply the full schema above via `prisma migrate dev --name init`
- Add `prisma/seed.ts` with test data (admin user, group, tournament, a couple of games); wire `prisma db seed` in `package.json` (`prisma.seed` field)
- Set up `lib/db.ts` (Prisma client singleton) and `lib/auth.ts` (Auth.js config)
- Verify: `prisma studio` opens against local DB; `prisma db seed` runs without error; all tables populated as expected

### Phase 2 — Auth

**Status**: Implemented.

- Implement Auth.js Credentials provider in `lib/auth.ts` with bcrypt password check
- Create `/register` page: form → POST to create `User` → redirect to login
- Create `/login` page: form → Auth.js `signIn` → redirect to dashboard
- Add `proxy.ts` (Next.js 16; replaces `middleware.ts`) to protect app routes such as `/dashboard`
- Verify: can register, login, logout; protected routes redirect unauthenticated users

### Phase 3 — Groups & Members

**Status**: Implemented.

- Implement `POST /api/groups` and `PUT /api/groups/[id]` for creating and editing groups (creator becomes admin via `GroupMember.isAdmin = true` on create)
- Implement `POST /api/groups/[id]/members`: admin-only; body `{ "email": "..." }` — looks up registered user, creates `GroupMember` (`isAdmin: false`); handle 404/409 as above
- Verify: registered user can be added to a group by email; non-members cannot access group data until added

### Phase 4 — Tournaments & Games (Admin)

**Status**: Implemented.

- Implement `POST /api/tournaments` and `PUT /api/tournaments/[id]` for creating and editing tournaments (admin only)
- Implement `POST /api/games` and `PUT /api/games/[id]` for adding and editing games (admin only)
- On `/tournaments` page, show an "Add tournament" button visible only to admins — opens a modal/form that calls `POST /api/tournaments`
- On `/tournaments/[id]` page, show an "Add game" button and per-game "Edit" controls visible only to admins - opens a modal to create/ edit game
- Build result entry UI inline on the games list (admin-only controls) that calls `POST /api/games/[id]/result`
- Verify: admin can create a full tournament with games; non-admin users do not see admin controls

### Phase 5 — Betting UI
- Build `/dashboard`: list of upcoming games (kickoff in future), sorted by kickoff date
- Each game shows a `BetForm` component: two number inputs (home score, away score) + submit button
- `BetForm` calls `POST /api/bets` (creates) or `PUT /api/bets` (updates); disabled after kickoff
- Show existing bet if user has already bet on a game
- Verify: user can submit and edit a bet before kickoff; form is disabled after kickoff

### Phase 6 — Result Entry & Scoring
- Implement `lib/scoring.ts` with `calculatePoints` function
- Wire up `POST /api/games/[id]/result`: validate admin, update game scores, calculate + write `pointsAwarded` for all bets in a transaction
- Verify: after entering a result, all bets for the game have correct `pointsAwarded` values in the DB

### Phase 7 — Leaderboard
- Build `/tournaments/[id]/leaderboard` as a server component: runs the grouped SUM query scoped to the tournament, renders a ranked table (rank, name, points)
- Add navigation links throughout the app
- Verify: leaderboard reflects correct totals after results are entered

### Phase 8 — Polish & deployment
- Add empty states (no tournaments, no games, no bets yet)
- Add loading skeletons for slow data fetches
- Mobile-responsive layout
- Basic error handling (toasts for form errors)
- **Deploy to Vercel**
  - Create/link Vercel project to the git repo; production branch deploys on push
  - In Vercel project settings, set environment variables: `DATABASE_URL` (Neon connection string), `AUTH_SECRET` (generate a secure random string), `NEXTAUTH_URL` (canonical production URL, e.g. `https://your-app.vercel.app`)
  - Ensure production build runs `prisma migrate deploy` (e.g. `postinstall` or `vercel-build` script) so the Neon schema stays in sync — never run `prisma migrate dev` against production
  - Confirm the live site connects to Neon and auth/session flows work end-to-end

### Phase 9 — PWA (installable on phone)

Next.js 15 App Router has built-in manifest support — no extra library needed.

**New files:**

- **`app/manifest.ts`** — Web App Manifest (name, icons, `display: "standalone"`, theme colour)
- **`public/icon-192.png`** and **`public/icon-512.png`** — app icons at required sizes
- **`public/sw.js`** — service worker (minimal; extended in Phase 10 for push)
- **`components/ServiceWorkerRegistrar.tsx`** — client component that calls `navigator.serviceWorker.register("/sw.js")` on mount; rendered once in `app/(app)/layout.tsx`

**Verify:**
- Chrome DevTools → Application → Manifest shows no errors
- "Add to Home Screen" prompt appears (or can be triggered manually)
- Installed app opens in standalone mode (no browser chrome)

> iOS note: requires iOS 16.4+ and the app must be installed to the home screen before push notifications work.

---

### Phase 10 — Push notifications (remind users to bet)

#### Flow

```
User taps "Enable Notifications"
  → browser requests Notification permission
  → PushManager.subscribe() generates a subscription (endpoint + keys)
  → POST /api/push/subscribe saves it as a PushSubscription row

Vercel Cron (hourly)
  → POST /api/cron/notify-missing-bets
  → query: games kicking off in the next 24 h with no result yet
  → for each game: find group members with no Bet row
  → for each such user: fetch their PushSubscription rows
  → send push via web-push library
  → service worker shows: "Time to place your bet! Real Madrid vs Barça kicks off in Xh"
  → user taps → opens /dashboard
```

#### New dependency

```
npm install web-push
npm install --save-dev @types/web-push
```

#### Schema migration

Run `prisma migrate dev --name add-push-subscriptions` after adding the `PushSubscription` model (see [docs/database-schema.md](../database-schema.md)).

#### New files and routes

| File | Purpose |
|---|---|
| `lib/webpush.ts` | Initialises `web-push` with VAPID keys; exports `sendPush(sub, payload)` helper; deletes expired subscriptions (HTTP 410) automatically |
| `app/api/push/subscribe/route.ts` | `POST` — upserts a `PushSubscription` row for the session user; `DELETE` — removes it |
| `app/api/cron/notify-missing-bets/route.ts` | Protected cron handler (checks `Authorization: Bearer ${CRON_SECRET}`); queries unbetted upcoming games and sends pushes |
| `vercel.json` | Declares the hourly cron: `{ "crons": [{ "path": "/api/cron/notify-missing-bets", "schedule": "0 * * * *" }] }` |
| `components/NotificationToggle.tsx` | Client component with an enable/disable button; reads `Notification.permission`, subscribes via `pushManager`, calls the subscribe API |

#### Cron query logic (pseudocode)

```
games = Game.findMany({
  where: {
    kickoffAt: { gte: now, lte: now + 24h },
    homeScore: null,              // result not entered yet
  },
  include: { tournament: { include: { group: { include: { members: true } } } } }
})

for each game:
  usersWithBet = Bet.findMany({ where: { gameId: game.id } }).map(b => b.userId)
  usersWithoutBet = game.tournament.group.members
    .filter(m => !usersWithBet.includes(m.userId))
  for each user in usersWithoutBet:
    subscriptions = PushSubscription.findMany({ where: { userId: user.userId } })
    for each sub:
      sendPush(sub, { title: "Place your bet!", body: `${game.homeTeam} vs ${game.awayTeam}`, url: "/dashboard" })
      // if sendPush throws HTTP 410 → delete the stale subscription row
```

#### Key constraints and caveats

| Concern | Handling |
|---|---|
| iOS Safari | Push only works after PWA is installed to home screen (iOS 16.4+); `NotificationToggle` checks `display-mode: standalone` before showing the button |
| Multiple devices per user | A user may have multiple `PushSubscription` rows; all are notified |
| Expired subscriptions | `web-push` returns HTTP 410 for stale subscriptions; the cron handler deletes those rows |
| Duplicate notifications | The cron runs hourly; a notification is sent each hour until a bet is placed or kickoff passes |
| Local testing | Use `web-push send-notification` CLI or a test script to simulate a push against a local subscription |

**Verify:**
- After enabling notifications, a `PushSubscription` row exists in the DB for the user
- Manually calling `/api/cron/notify-missing-bets` with the correct `Authorization` header triggers a push to devices with no bet
- Tapping the notification opens `/dashboard`
- Disabling notifications deletes the subscription row
