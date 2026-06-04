# Rules

**Language**

All user-facing UI text (labels, buttons, titles, descriptions, error messages, placeholders) must be written in Polish.

**Creating components**

Use following template when creating new React components:

```
interface Props {}

export const NewComponent: React.FC = ({}) => {

}
```

**Database changes**

Any database schema changes should be added to /docs/database-schema.md file.

**Code quality**

Before commiting any code:

- check and fix any potential issues with `npm run check`
- make sure all logic changes are covered with tests
- make sure all tests are passing

# Project structure

All feature-specific code lives under `features/<feature>/` — never inside `app/api/*`, never inside `components/*` (except `components/ui/` which is shadcn primitives), never inline in `app/(app)/*/page.tsx`.

**Feature folder shape** (`features/<feature>/`):

- `components/` — React components (server and client; the `"use client"` directive is the boundary, no subfolder split)
- `server/` — server-only data access for server components; every file starts with `import "server-only"`
- `api/` — API route handlers extracted from `app/api/*/route.ts`; every file starts with `import "server-only"`
- `schema.ts` — request-body validators (the `parseCreateBody`-style functions)
- `types.ts` — feature-local TypeScript types

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

# Commands

- run tests: `npm run test`
- check for issues in code: `npm run check`
