# Next.js 16 — key differences from v15

- `params`, `searchParams`, `cookies()`, `headers()`, and `draftMode()` are **async** — always `await` them
- Middleware is renamed: use `proxy.ts` (not `middleware.ts`) with a named export `proxy` (not `middleware`)
- `revalidateTag(tag)` requires a second `cacheLife` argument — use `updateTag(tag)` in Server Actions for immediate expiration
- `cacheLife` and `cacheTag` are stable imports from `next/cache` (no `unstable_` prefix)
- Turbopack is the default bundler — no custom webpack config unless you pass `--webpack`
- PPR is enabled via `cacheComponents: true` in next.config (not `experimental.ppr`)
- ESLint: `next lint` is deprecated — use the ESLint CLI directly
- Parallel route slots require an explicit `default.js` file
- `next/legacy/image` and `images.domains` are deprecated
- Reference: https://nextjs.org/docs/app/guides/upgrading/version-16

# Rules

**Language**

All user-facing UI text (labels, buttons, titles, descriptions, error messages, placeholders) must be written in Polish.

**Code quality**

Run ESLint to check for potential issues after every change

**Creating components**

Use following template when creating new React components:

```
interface Props {}

export const NewComponent: React.FC = ({}) => {

}
```

# Database changes

Any database schema changes should be added to /docs/database-schema.md file.

# Project structure

All feature-specific code lives under `features/<feature>/` — never inside `app/api/*`, never inside `components/*` (except `components/ui/` which is shadcn primitives), never inline in `app/(app)/*/page.tsx`.

**Feature folder shape** (`features/<feature>/`):

- `components/` — React components (server and client; the `"use client"` directive is the boundary, no subfolder split)
- `server/` — server-only data access for server components; every file starts with `import "server-only"`
- `api/` — API route handlers extracted from `app/api/*/route.ts`; every file starts with `import "server-only"`
- `schema.ts` — request-body validators (the `parseCreateBody`-style functions)
- `types.ts` — feature-local TypeScript types

**Existing features**: `tournament`, `game`, `group`, `auth`. Add new ones as singular nouns (`bet`, `notification`, …).

**Routing glue in `app/`**:

- `app/**/page.tsx` is a thin shim: check auth, call `features/<feature>/server/*`, render `features/<feature>/components/*`.
- `app/api/**/route.ts` is a wrapper only:

    ```ts
    import { createTournament } from "@/features/tournament/api/create-tournament";

    export async function POST(req: Request) {
        return createTournament(req);
    }
    ```

**Import rules**:

- No barrel `index.ts` files — import the specific file: `import { GameCard } from "@/features/game/components/game-card"`.
- Cross-feature imports are allowed via `features/X/components/*` and `features/X/server/*`.
- Shared authz helpers (`requireAuth`, `requireGroupAdmin`, `requireTournamentAdmin`) stay in `lib/api-utils.ts` — infra, not a feature.
- `components/ui/` (shadcn) and `lib/` (`db.ts`, `auth.ts`, `utils.ts`, `datetime-local.ts`, `api-utils.ts`) are shared infra and never hold feature logic.

# Testing

- **Runner**: Vitest (`npm run test` watch, `npm run test:run` CI-style).
- **Where tests live**: `features/<feature>/__tests__/**/*.test.{ts,tsx}` (and optionally `lib/**/__tests__/**/*.test.ts`). Shared helpers live in top-level `test/` (not under `features/`).
- **Global mocks** (see [test/setup.ts](test/setup.ts)):
    - `@/lib/db` → deep-mocked Prisma client from [test/prisma.ts](test/prisma.ts); reset each test via `mockReset` in `afterEach`.
    - `@/lib/auth` → `auth` is a `vi.fn()` defaulting to unauthenticated (`null`). Use [test/auth.ts](test/auth.ts): `mockAuthedUser({ id })` / `mockUnauthed()`.
    - `next/navigation` → [test/router.ts](test/router.ts) `mockRouter` (`push`, `refresh`, …).
    - `next-auth/react` → `signIn` is a `vi.fn()`; configure per component test.
    - `server-only` is aliased to an empty stub so `features/*/api/*` and `features/*/server/*` import in Vitest.
- **Handlers**: build requests with [test/request.ts](test/request.ts); assert JSON responses with [test/response.ts](test/response.ts) (`readJson`) — remember `NextResponse.json` serializes `Date` as ISO strings in the wire body.
- **Fixtures**: [test/factories.ts](test/factories.ts) for Prisma-shaped objects.
