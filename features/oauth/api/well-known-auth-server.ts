import "server-only";

import { NextResponse } from "next/server";

export function getOauthAuthorizationServerMetadata(request: Request) {
    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;
    return NextResponse.json(
        {
            issuer: base,
            authorization_endpoint: `${base}/oauth/authorize`,
            token_endpoint: `${base}/api/oauth/token`,
            registration_endpoint: `${base}/api/oauth/register`,
            response_types_supported: ["code"],
            grant_types_supported: ["authorization_code", "refresh_token"],
            code_challenge_methods_supported: ["S256"],
            token_endpoint_auth_methods_supported: ["none"],
            scopes_supported: ["mcp"],
        },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}
