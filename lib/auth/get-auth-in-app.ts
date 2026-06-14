import "server-only";

import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";

export async function getAuthInApp(): Promise<Session> {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    return session;
}
