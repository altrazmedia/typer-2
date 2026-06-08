import "server-only";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireSessionAuth } from "@/lib/api-utils";

export async function handleAuthorizeSubmit(request: Request) {
    const authResult = await requireSessionAuth();
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;
    const userId = session.user.id;

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowy format żądania." },
            { status: 400 },
        );
    }

    const action = formData.get("action");
    const clientId = formData.get("client_id");
    const redirectUri = formData.get("redirect_uri");
    const state = formData.get("state");
    const codeChallenge = formData.get("code_challenge");
    const codeChallengeMethod = formData.get("code_challenge_method");

    if (
        typeof clientId !== "string" ||
        typeof redirectUri !== "string" ||
        typeof codeChallenge !== "string" ||
        typeof codeChallengeMethod !== "string"
    ) {
        return NextResponse.json(
            { error: "Brakujące parametry autoryzacji." },
            { status: 400 },
        );
    }

    const client = await prisma.oAuthClient.findUnique({
        where: { id: clientId },
    });
    if (!client || !client.redirectUris.includes(redirectUri)) {
        return NextResponse.json(
            { error: "Nieprawidłowy klient lub redirect_uri." },
            { status: 400 },
        );
    }

    const redirectUrl = new URL(redirectUri);

    if (action === "deny") {
        redirectUrl.searchParams.set("error", "access_denied");
        if (typeof state === "string") {
            redirectUrl.searchParams.set("state", state);
        }
        return NextResponse.redirect(redirectUrl.toString(), 302);
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const oauthCode = await prisma.oAuthCode.create({
        data: {
            clientId,
            userId,
            redirectUri,
            codeChallenge,
            codeChallengeMethod,
            expiresAt,
        },
    });

    redirectUrl.searchParams.set("code", oauthCode.code);
    if (typeof state === "string") {
        redirectUrl.searchParams.set("state", state);
    }

    return NextResponse.redirect(redirectUrl.toString(), 302);
}
