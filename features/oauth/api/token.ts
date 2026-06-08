import "server-only";

import { NextResponse } from "next/server";

import { parseTokenBody } from "@/features/oauth/schema";
import {
    signAccessToken,
    signRefreshToken,
    verifyToken,
} from "@/features/oauth/server/jwt";
import { verifyPkce } from "@/features/oauth/server/pkce";
import { prisma } from "@/lib/db";

const ACCESS_TOKEN_EXPIRES_IN = 3600;

export async function handleTokenRequest(request: Request) {
    let body: unknown;
    try {
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("application/x-www-form-urlencoded")) {
            const text = await request.text();
            const params = new URLSearchParams(text);
            body = Object.fromEntries(params.entries());
        } else {
            body = await request.json();
        }
    } catch {
        return tokenError(
            "invalid_request",
            "Nieprawidłowy format żądania.",
            400,
        );
    }

    const parsed = parseTokenBody(body);
    if (!parsed) {
        return tokenError(
            "invalid_request",
            "Brakujące parametry żądania.",
            400,
        );
    }

    if (parsed.grant_type === "authorization_code") {
        return handleAuthorizationCodeGrant(
            parsed.code,
            parsed.redirect_uri,
            parsed.code_verifier,
            parsed.client_id,
        );
    }

    if (parsed.grant_type === "refresh_token") {
        return handleRefreshTokenGrant(parsed.refresh_token);
    }

    return tokenError(
        "unsupported_grant_type",
        "Nieobsługiwany grant_type.",
        400,
    );
}

async function handleAuthorizationCodeGrant(
    code: string | undefined,
    redirectUri: string | undefined,
    codeVerifier: string | undefined,
    clientId: string | undefined,
) {
    if (!code || !redirectUri || !codeVerifier || !clientId) {
        return tokenError(
            "invalid_request",
            "Brakujące parametry dla authorization_code.",
            400,
        );
    }

    const oauthCode = await prisma.oAuthCode.findUnique({ where: { code } });
    if (!oauthCode) {
        return tokenError(
            "invalid_grant",
            "Nieprawidłowy kod autoryzacji.",
            400,
        );
    }
    if (oauthCode.used) {
        return tokenError(
            "invalid_grant",
            "Kod autoryzacji został już użyty.",
            400,
        );
    }
    if (oauthCode.expiresAt < new Date()) {
        return tokenError("invalid_grant", "Kod autoryzacji wygasł.", 400);
    }
    if (oauthCode.clientId !== clientId) {
        return tokenError("invalid_grant", "Niezgodny client_id.", 400);
    }
    if (oauthCode.redirectUri !== redirectUri) {
        return tokenError("invalid_grant", "Niezgodny redirect_uri.", 400);
    }

    const pkceValid = await verifyPkce(codeVerifier, oauthCode.codeChallenge);
    if (!pkceValid) {
        return tokenError(
            "invalid_grant",
            "Nieprawidłowy code_verifier (PKCE).",
            400,
        );
    }

    await prisma.oAuthCode.update({
        where: { id: oauthCode.id },
        data: { used: true },
    });

    const [accessToken, refreshToken] = await Promise.all([
        signAccessToken(oauthCode.userId),
        signRefreshToken(oauthCode.userId),
    ]);

    return NextResponse.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES_IN,
    });
}

async function handleRefreshTokenGrant(refreshToken: string | undefined) {
    if (!refreshToken) {
        return tokenError("invalid_request", "Brakujący refresh_token.", 400);
    }

    const payload = await verifyToken(refreshToken);
    if (!payload) {
        return tokenError(
            "invalid_grant",
            "Nieprawidłowy lub wygasły refresh_token.",
            400,
        );
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
        return tokenError("invalid_grant", "Użytkownik nie istnieje.", 400);
    }

    const [accessToken, newRefreshToken] = await Promise.all([
        signAccessToken(user.id),
        signRefreshToken(user.id),
    ]);

    return NextResponse.json({
        access_token: accessToken,
        refresh_token: newRefreshToken,
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES_IN,
    });
}

function tokenError(error: string, description: string, status: number) {
    return NextResponse.json(
        { error, error_description: description },
        { status },
    );
}
