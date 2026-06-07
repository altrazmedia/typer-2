import "server-only";

import { SignJWT, jwtVerify } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export async function signAccessToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(getSecret());
}

export async function signRefreshToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId, type: "refresh" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getSecret());
}

export async function verifyToken(
    token: string,
): Promise<{ sub: string } | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret(), {
            algorithms: ["HS256"],
        });
        if (typeof payload.sub !== "string") return null;
        return { sub: payload.sub };
    } catch {
        return null;
    }
}
