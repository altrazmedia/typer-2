import { Suspense } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { getAuthInApp } from "@/lib/auth/get-auth-in-app";

import {
    TournamentsOverview,
    TournamentsOverviewLoading,
} from "@/features/tournament/components/tournaments-overview";

export async function TournamentsPage() {
    const session = await getAuthInApp();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                header="Turnieje"
                subHeader="Przeglądaj turnieje w grupach, do których należysz"
            />
            <Suspense fallback={<TournamentsOverviewLoading />}>
                <TournamentsOverview userId={session.user.id} />
            </Suspense>
        </div>
    );
}
