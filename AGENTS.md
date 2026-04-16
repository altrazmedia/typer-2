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

