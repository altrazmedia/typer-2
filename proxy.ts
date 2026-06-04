import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const proxy = auth((req) => {
    if (!req.auth) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set(
            "callbackUrl",
            `${req.nextUrl.pathname}${req.nextUrl.search}`,
        );
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
});

export const config = {
    // Extend this list when adding more routes under app/(app)/ (route groups do not appear in URLs).
    matcher: [
        "/tournaments",
        "/tournaments/:path*",
    ],
};
