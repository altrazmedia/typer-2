# Typer 2

Football betting app for a private group. Planned and implemented fully with AI agents using Cursor.

## Local setup

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

3. **Optional** — `npm run studio` to inspect data in Prisma Studio.

### Seed data

- User: `admin@example.com` / `password`
- Group, tournament “World Cup 2026”, two sample games
