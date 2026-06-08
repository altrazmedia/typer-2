import type { DcrBody, TokenBody } from "@/features/oauth/types";

export function parseDcrBody(body: unknown): DcrBody | null {
    if (typeof body !== "object" || body === null) return null;
    const b = body as Record<string, unknown>;
    if (typeof b.client_name !== "string" || !b.client_name.trim()) return null;
    if (
        !Array.isArray(b.redirect_uris) ||
        b.redirect_uris.length === 0 ||
        !b.redirect_uris.every((u) => typeof u === "string" && u.length > 0)
    )
        return null;
    return {
        client_name: b.client_name.trim(),
        redirect_uris: b.redirect_uris as string[],
        token_endpoint_auth_method:
            typeof b.token_endpoint_auth_method === "string"
                ? b.token_endpoint_auth_method
                : "none",
        grant_types: Array.isArray(b.grant_types)
            ? (b.grant_types as string[])
            : ["authorization_code"],
        response_types: Array.isArray(b.response_types)
            ? (b.response_types as string[])
            : ["code"],
    };
}

export function parseTokenBody(body: unknown): TokenBody | null {
    if (typeof body !== "object" || body === null) return null;
    const b = body as Record<string, unknown>;
    if (typeof b.grant_type !== "string") return null;
    return {
        grant_type: b.grant_type,
        code: typeof b.code === "string" ? b.code : undefined,
        redirect_uri:
            typeof b.redirect_uri === "string" ? b.redirect_uri : undefined,
        client_id: typeof b.client_id === "string" ? b.client_id : undefined,
        code_verifier:
            typeof b.code_verifier === "string" ? b.code_verifier : undefined,
        refresh_token:
            typeof b.refresh_token === "string" ? b.refresh_token : undefined,
    };
}
