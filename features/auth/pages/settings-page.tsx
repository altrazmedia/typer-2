import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import { ApiKeySection } from "@/features/auth/components/api-key-section";

export function SettingsPage() {
    return (
        <Suspense>
            <SettingsPageContent />
        </Suspense>
    );
}

async function SettingsPageContent() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="space-y-8">
            <h1 className="font-heading text-2xl font-semibold">Ustawienia</h1>
            <ApiKeySection />
        </div>
    );
}
