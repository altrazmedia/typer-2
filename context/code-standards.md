# Code standards

Follow these rules while implementing new features.

## TypeScript

- never use `any`; use `unknown` and narrow the type
- all function parameters and return types must be explicitly typed
- define object-shaped types as named interfaces — never inline them in function signatures; place the interface before the function that uses it
- all async functions must handle errors explicitly — never let promises reject silently
- use the `void` operator to explicitly discard floating promises (e.g. `void fetchData()`)

## Components

- extract business logic to standalone functions or custom hooks outside of the component
- follow this structure when creating a new component:

```tsx
"use client"; // only if needed

// imports
import { useState } from "react";

// type definitions; always a named interface
interface Props {
    tournamentId: string;
    onSubmit(): void;
}

// component definition; use React.FC<Props> typing
export const ComponentName: React.FC<Props> = ({
    tournamentId,
    onSubmit,
}) => {};
```

Keep only one component per file. Exceptions:

- loading components (skeletons)
- UI components consisting of multiple tightly coupled pieces, such as `Card`, `CardTitle`, `CardBody`, etc.

### Loading components

If a component needs a loading state (used inside `<Suspense>`), define it in the same file using the same name with a `Loading` suffix. Apply skeleton styling with the `animate-pulse` class.

## Schema parsing

Request body validation lives in `features/<feature>/schema.ts`. Write manual parse functions that return a typed result or `null` — do not use Zod. Keep the corresponding input type in the same file.

```ts
type CreateFooInput = {
    name: string;
};

export function parseCreateFooBody(body: unknown): CreateFooInput | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    if (typeof o.name !== "string" || !o.name.trim()) return null;
    return { name: o.name.trim() };
}
```

## Server Actions

All server actions live in `features/<feature>/actions/` and must start with:

```ts
"use server";

import "server-only";
```

Every server action must return `Promise<ServerActionResponse<T>>` from `@/lib/types`. Use the `getSuccessActionResponse()` and `getErrorActionResponse()` helpers from `@/lib/server-action-response` to construct responses — never throw from a server action.

```ts
import type { ServerActionResponse } from "@/lib/types";
import {
    getSuccessActionResponse,
    getErrorActionResponse,
} from "@/lib/server-action-response";

export async function doSomethingAction(
    args: DoSomethingActionArgs,
): Promise<ServerActionResponse> {
    // ...
    return getSuccessActionResponse();
    // or
    return getErrorActionResponse("Coś poszło nie tak.");
}
```

When the action needs to return data on success, use the generic parameter:

```ts
export async function createFooAction(
    args: CreateFooActionArgs,
): Promise<ServerActionResponse<{ id: string }>> {
    // ...
    return getSuccessActionResponse({ id: newFoo.id });
}
```

## Server-only modules

All files under `features/<feature>/server/` and `features/<feature>/api/` must start with:

```ts
import "server-only";
```

This prevents accidental inclusion in client bundles.

## Language

All user-facing text in the web app and API responses (labels, buttons, titles, descriptions, error messages, placeholders) must be written in Polish. Use English when writing or refining GitHub issues.

## Files

- use kebab-case for file names
- no barrel exports (`index.ts` files)
- if a type needs to be exported outside the component file, move it to `types.ts` in the relevant feature folder
- pure utility functions belong in `features/<feature>/helpers/` — one function per file

## General code rules

- comments — never explain what the code does; explain _why_ only when the reason is non-obvious
- start function names with a verb (e.g. `getUser()`, `handleButtonClick()`)
- start boolean names with `is`, `should`, `has`, `can`, etc. (e.g. `isThemeApplied`, `shouldDisplayError`)
- avoid abbreviations in function and variable names
- keep functions short; split into multiple focused functions when needed

## Testing

- write tests with [Vitest](https://vitest.dev/)
- every function containing business logic must be covered by unit tests
- test files live in `features/<feature>/__tests__/` and are named `*.test.ts` or `*.test.tsx`

## Before committing

Run the following command and fix any ESLint, Prettier, or TypeScript issues before committing:

```bash
npm run check
```
