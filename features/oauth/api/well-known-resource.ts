import "server-only";

import { NextResponse } from "next/server";

export function getOauthProtectedResourceMetadata(request: Request) {
    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;
    return NextResponse.json(
        {
            resource: `${base}/api/mcp`,
            authorization_servers: [`${base}`],
            bearer_methods_supported: ["header"],
            scopes_supported: ["mcp"],
        },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}
