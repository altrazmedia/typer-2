import type { ServerActionResponse } from "@/lib/types";

export function getSuccessActionResponse(): ServerActionResponse<void>;
export function getSuccessActionResponse<T>(data: T): ServerActionResponse<T>;
export function getSuccessActionResponse<T>(
    data?: T,
): ServerActionResponse<T | void> {
    if (data !== undefined) {
        // The overloads guarantee type safety for callers; the cast is needed
        // because TypeScript cannot resolve the conditional type statically.
        return {
            isSuccess: true,
            data,
        } as unknown as ServerActionResponse<T | void>;
    }
    return { isSuccess: true };
}

export function getErrorActionResponse(errorMessage: string): {
    isSuccess: false;
    errorMessage: string;
} {
    return { isSuccess: false, errorMessage };
}
