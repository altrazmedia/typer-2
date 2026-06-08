# Typer 2

Football betting app for a private group. Planned and implemented fully with AI agents using Cursor.

## Local setup

1. **Environment** — copy `.env.example` to `.env` and `.env.local`, set `DATABASE_URL` and `AUTH_SECRET` (same values locally are fine for dev).

    For push notifications, also set:

    | Variable                       | Description                                               |
    | ------------------------------ | --------------------------------------------------------- |
    | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key (`npx web-push generate-vapid-keys`)     |
    | `VAPID_PRIVATE_KEY`            | Private VAPID key                                         |
    | `VAPID_SUBJECT`                | Contact URI, e.g. `mailto:your@email.com`                 |
    | `CRON_SECRET`                  | Random secret for cron endpoints (`openssl rand -hex 32`) |

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

---

## OAuth 2.1 authorization server

Typer 2 includes a built-in OAuth 2.1 authorization server that issues short-lived JWT access tokens. MCP clients (Cursor, Claude Desktop, etc.) use this server to authenticate on behalf of a logged-in user.

### How it works

1. **Dynamic Client Registration** (`POST /api/oauth/register`) -- The MCP client registers itself and receives a `client_id`. No secret is issued; public clients with PKCE are the only supported mode.

2. **Authorization code flow** (`GET /oauth/authorize`) -- The user is redirected here. If not logged in, they are sent to `/login` first. After login they see a consent screen listing what the client is requesting.

3. **Form submission** (`POST /api/oauth/authorize`) -- Clicking **Zezwol** issues a one-time authorization code (10-minute TTL) and redirects back to the client's `redirect_uri`.

4. **Token exchange** (`POST /api/oauth/token`) -- The client exchanges the code (verifying the PKCE `code_verifier`) for a short-lived access token (1 hour) and a refresh token (30 days).

5. **Token refresh** (`POST /api/oauth/token` with `grant_type=refresh_token`) -- Exchanges a refresh token for a new access + refresh token pair.

### Well-known endpoints

| URL                                           | Description                              |
| --------------------------------------------- | ---------------------------------------- |
| `GET /.well-known/oauth-authorization-server` | Authorization server metadata (RFC 8414) |
| `GET /.well-known/oauth-protected-resource`   | Protected resource metadata (RFC 9728)   |

---

## MCP integration

The app exposes an MCP (Model Context Protocol) endpoint at `POST /api/mcp` using the Streamable HTTP transport. All requests must carry a valid Bearer JWT obtained via the OAuth flow above.

### Connecting Cursor

1. Start the app locally (`npm run local` or `npm run local:docker`).

2. Open **Cursor Settings -> MCP -> Add server** and set the URL to:

    ```
    http://localhost:3000/api/mcp
    ```

    Cursor will auto-discover the OAuth server via `/.well-known/oauth-authorization-server`, perform Dynamic Client Registration, redirect you through the consent page, and store the tokens.

3. Once connected, the `whoami` tool is available -- it returns your user id, name, and email.

### Available MCP tools

| Tool     | Description                                                |
| -------- | ---------------------------------------------------------- |
| `whoami` | Returns the authenticated user's `id`, `name`, and `email` |

### Authentication errors

If the Bearer token is missing or expired the endpoint returns:

```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="/.well-known/oauth-protected-resource"
```

The `resource_metadata` URL tells the MCP client where to find the authorization server so it can re-authenticate automatically.
