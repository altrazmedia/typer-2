import { vi } from "vitest";

/** Shared router mock; `test/setup.ts` wires it to `next/navigation`. */
export const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
};
