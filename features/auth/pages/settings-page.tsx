import { Suspense } from "react";

import { getAuthInApp } from "@/lib/auth/get-auth-in-app";

import { ApiKeySection } from "@/features/auth/components/api-key-section";
import { McpSection } from "@/features/auth/components/mcp-section";
import { InstallPwaButton } from "@/features/pwa/components/install-pwa-button";
import { NotificationToggle } from "@/features/pwa/components/notification-toggle";

export function SettingsPage() {
    return (
        <Suspense>
            <SettingsPageContent />
        </Suspense>
    );
}

async function SettingsPageContent() {
    await getAuthInApp();

    return (
        <div className="space-y-8">
            <h1 className="font-heading text-2xl font-semibold">Ustawienia</h1>
            <NotificationToggle />
            <InstallPwaButton />
            <McpSection />
            <ApiKeySection />
        </div>
    );
}
