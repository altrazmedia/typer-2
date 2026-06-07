import "server-only";

import { NextResponse } from "next/server";

import { parseDcrBody } from "@/features/oauth/schema";
import { prisma } from "@/lib/db";

export async function registerOAuthClient(request: Request) {
    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowy format żądania." },
            { status: 400 },
        );
    }

    const body = parseDcrBody(json);
    if (!body) {
        return NextResponse.json(
            { error: "Podaj client_name i co najmniej jeden redirect_uri." },
            { status: 400 },
        );
    }

    const client = await prisma.oAuthClient.create({
        data: {
            clientName: body.client_name,
            redirectUris: body.redirect_uris,
        },
    });

    return NextResponse.json(
        {
            client_id: client.id,
            client_name: client.clientName,
            redirect_uris: client.redirectUris,
            token_endpoint_auth_method: "none",
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
        },
        { status: 201 },
    );
}
