---
name: issue-implementation
description: Fetch a GitHub issue and plan its implementation. Use when the user provides a GitHub issue number or URL and wants to start implementing it. Creates a properly named branch from main, plans the work, and ensures tests are included.
---

# Issue Implementation

## Workflow

### 1. Fetch the issue

Use `gh issue view <number>` to retrieve the issue details. If the user provided a URL, extract the issue number from it.

### 2. Sync with remote main

```bash
git fetch origin
git checkout main
git pull origin main
```

If there are uncommitted changes, stop and ask the user how to proceed before switching branches.

### 3. Create a feature branch

Branch name format: `<issue-number>-<kebab-case-title>`

```bash
git checkout -b 12-create-login-form
```

Derive the slug from the issue title: lowercase, spaces → hyphens, strip special characters, max ~50 chars.

### 4. Plan the implementation

Read relevant existing code before proposing anything. Proceed only if there are no blockers mentioned in the issue. Then present a concise plan covering:

- What files will be created or changed
- Key design decisions (with reasoning)
- How the feature integrates with existing code
- What tests need to be added or updated

**Ask the user to confirm the plan before writing any code.** If you have doubts about scope, approach, or requirements, ask now.

### 5. Implement

Follow the confirmed plan. Apply project conventions from `AGENTS.md`.

### 6. Tests

Add or update tests for every changed behaviour:

- New feature → add tests in `features/<feature>/__tests__/`
- Bug fix → add a regression test
- Refactor → keep existing tests green; add tests for any newly exposed logic

Run tests to verify: `npm run test:run`

### 7. Lint

```bash
npx eslint .
```

Fix any errors before finishing.
