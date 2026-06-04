# Typer 2

Football betting app for a private group — see [docs/plans/2026-04-07-football-betting-app-design.md](docs/plans/2026-04-07-football-betting-app-design.md).

## Local setup (Phase 1)

1. **Environment** — copy `.env.example` to `.env` and `.env.local`, set `DATABASE_URL` and `AUTH_SECRET` (same values locally are fine for dev).

2. **One-shot local stack** — Postgres (Docker), migrations, seed, and Next.js dev on the host:

    ```bash
    npm run local
    ```

    Open [http://localhost:3000](http://localhost:3000).

    **WSL2 / Turbopack issues** — run the full stack in Docker (hot reload, webpack dev server):

    ```bash
    npm run local:docker
    ```

    Stop with `npm run local:docker:down`. `AUTH_SECRET` is taken from `.env` / `.env.local`; `DATABASE_URL` for the app container is set in `docker-compose.dev.yml` (`@db:5432`, not `localhost`).

3. **Step by step** — if you prefer to run pieces yourself:

    ```bash
    npm run db:up          # docker compose up -d --wait (waits until Postgres is healthy)
    npm run db:prepare     # migrate deploy + seed
    npm run dev
    ```

    For schema changes during development, use `npx prisma migrate dev` instead of `migrate deploy`.

4. **Optional** — `npm run studio` to inspect data in Prisma Studio.

### Seed data

- User: `admin@example.com` / `password`
- Group, tournament “World Cup 2026”, two sample games

## Scripts

| Command              | Description                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| `npm run local`      | Start Postgres, run migrations, seed, then Next.js dev on the host              |
| `npm run local:docker` | Postgres + migrations + seed + Next.js dev, all in Docker (hot reload)      |
| `npm run local:docker:down` | Stop full-stack Docker dev containers                                    |
| `npm run db:up`      | Start Postgres in Docker and wait until it is healthy                           |
| `npm run db:down`    | Stop and remove containers (volume kept)                                        |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`)                                      |
| `npm run db:seed`    | Run seed script                                                                 |
| `npm run db:prepare` | Migrate + seed                                                                  |
| `npm run studio`     | Open Prisma Studio                                                              |
| `npm run dev`        | Next.js dev server only                                                         |
| `npm run build`      | Production build                                                                |
| `npm run lint`       | ESLint                                                                          |

**Note:** Next.js 16 does not include `next lint`; this project uses `eslint .` instead.
