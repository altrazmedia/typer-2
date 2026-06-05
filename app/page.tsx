import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

export default function Home() {
    return (
        <Suspense fallback={null}>
            <HomeRedirect />
        </Suspense>
    );
}

async function HomeRedirect(): Promise<null> {
    const session = await auth();

    if (session?.user) {
        redirect("/tournaments");
    }

    redirect("/login");
    return null;
}
