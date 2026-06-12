# Architecture

## Tech Stack

| Layer      | Technology                      | Purpose                                                                                                    |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router)         | Full-stack monorepo — React UI + API routes in one project                                                 |
| Language   | TypeScript                      | End-to-end type safety                                                                                     |
| Data       | Prisma + Postgres               | Type-safe queries, schema-first migrations                                                                 |
| Auth       | Auth.js v5 (NextAuth) / API Key | Credentials provider (email + bcrypt password), session cookies; some API endpoints also accept an API Key |
| Styling    | Tailwind CSS + shadcn/ui        | Fast, accessible, consistent UI components                                                                 |
| PWA        | Service Worker + Web Push API   | Installable app with browser push notifications                                                            |
| Unit tests | Vitest                          | Unit tests for all business logic                                                                          |

## Auth

All application content is available only for signed-in users.

### NextAuth

Main auth provider. Users create accounts and sign in using an email + password combination. Authentication is handled via session cookies.

### API Key

Some API endpoints accept an API Key as an alternative authentication method. Each user can generate their own API Key and pass it in the `X-API-Key` request header.

### OAuth

An additional auth flow created solely for MCP integration. Contains several API endpoints and one Authorize page (`app/oauth/authorize/`). Should only be used for MCP.

## Features

| Feature      | Description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| `auth`       | Registration, login, settings (profile, API key, push notifications)               |
| `group`      | User groups — create, join, manage members and admins                              |
| `tournament` | Tournaments belonging to a group; manages scoring rules                            |
| `game`       | Football matches within a tournament; stores kickoff time, teams, and final scores |
| `bet`        | User predictions for game scores; evaluated and scored once a result is entered    |
| `pwa`        | PWA support — manages browser push subscriptions (`PushSubscription` model)        |
| `mcp`        | MCP server integration — exposes app data via MCP-compatible API endpoints         |
| `oauth`      | OAuth 2.0 authorization flow used exclusively by the MCP integration               |

## Files Structure

- All feature-specific code lives under `features/<feature>/`; each app module/feature has its own folder there
- Shared infra (Prisma client, NextAuth config, shadcn primitives, authz helpers) stays in `lib/`
- UI primitive components (buttons, inputs, dialogs, etc.) meant to be reused are placed in `components/ui/`

```
typer-2/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                  # shared layout for auth-related pages
│   │   ├── login/page.tsx              # shim → features/auth LoginForm
│   │   └── register/page.tsx           # shim → features/auth RegisterForm
│   ├── (app)/                          # Protected routes (require auth)
│   │   ├── layout.tsx                  # shared layout for protected pages; contains global navigation
│   │   └── <pages>/...                 # all protected pages
│   ├── oauth/                          # OAuth authorization flow (MCP only)
│   │   └── authorize/page.tsx          # shim → features/oauth AuthorizePage
│   ├── api/                            # Every route.ts is a thin wrapper
│   │   ├── auth/[...nextauth]/         # Auth.js handler (infra, not a feature)
│   │   └── <api-routes>/...            # API endpoint wrappers
│   ├── manifest.ts                     # PWA web app manifest
│   ├── sw.ts                           # Service worker registration
│   └── providers.tsx                   # Global React context providers
├── features/
│   ├── <feature-name>/
│   │   ├── actions/                    # Next.js Server Actions; every file starts with `"use server"` and `import "server-only"`
│   │   ├── api/                        # API route handlers (imported by app/api/**/route.ts)
│   │   ├── components/                 # Feature-related React components (server and client)
│   │   ├── helpers/                    # Pure utility functions; one function per file
│   │   ├── pages/                      # Page-level React components used as shims in app/
│   │   ├── server/                     # Server-only data access for Server Components; every file starts with `import "server-only"`
│   │   ├── <domain>.ts                 # Optional: domain logic files at the feature root (e.g. game/scoring.ts)
│   │   ├── schema.ts                   # Request-body validators (zod schemas)
│   │   └── types.ts                    # Feature-local TypeScript types
├── components/
│   └── ui/                             # shadcn/ui primitives (shared); no business logic
├── lib/                                # Shared infra; one function/hook per file
│   ├── db.ts                           # Prisma client singleton
│   ├── auth.ts                         # NextAuth config
│   ├── api-utils.ts                    # Shared authz helpers (requireAuth, requireGroupAdmin, …)
│   ├── api-key.ts                      # API Key verification
│   ├── webpush.ts                      # Web Push (VAPID) helpers
│   ├── utils.ts                        # General utilities
│   ├── datetime-local.ts               # Date/time formatting helpers
│   └── theme.ts / toast.ts / use-*.ts  # UI/client-side hooks and utilities
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                         # Dev/test data (admin user, group, tournament, games)
├── test/                               # Vitest setup, utilities and mocks (no test files here)
├── docker-compose.yml                  # Local Postgres (not used in production)
├── docker-compose.dev.yml              # Optional full-stack dev overlay (app + db)
├── Dockerfile.dev                      # Dev image for local Docker setup
├── tailwind.config.ts
└── package.json
```

### Routing glue in `app/`

- `app/**/page.tsx` is a thin shim: check auth, call `features/<feature>/server/*`, render `features/<feature>/components/*`.
- `app/api/**/route.ts` is a wrapper only:

    ```ts
    import { createTournament } from "@/features/tournament/api/create-tournament";

    export async function POST(req: Request) {
        return createTournament(req);
    }
    ```

### Import rules

- No barrel `index.ts` files — import the specific file: `import { GameCard } from "@/features/game/components/game-card"`.
- Cross-feature imports are allowed via `features/X/components/*` and `features/X/server/*`.
- Shared authz helpers (`requireAuth`, `requireGroupAdmin`, `requireTournamentAdmin`) stay in `lib/api-utils.ts` — infra, not a feature.
- `components/ui/` (shadcn) and `lib/` (`db.ts`, `auth.ts`, `utils.ts`, `datetime-local.ts`, `api-utils.ts`) are shared infra and never hold feature logic.

## Database Schema (Prisma)

> Full schema: [prisma/schema.prisma](../prisma/schema.prisma)

### Entities at a Glance

| Model              | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `User`             | Registered user — email, hashed password, display name                        |
| `Group`            | A circle of friends sharing tournaments                                       |
| `GroupMember`      | Join table — links users to groups, tracks the admin flag                     |
| `Tournament`       | A competition (e.g. World Cup 2026) belonging to a group                      |
| `Game`             | A match with teams, kickoff time, and optional result scores                  |
| `Bet`              | A user's predicted score for a game, with awarded points once a result is set |
| `PushSubscription` | Browser push subscription (endpoint + VAPID keys) per user device             |
