import { Suspense } from "react";

import { PageHeader } from "@/components/ui/page-header";

import {
    TournamentsOverview,
    TournamentsOverviewLoading,
} from "@/features/tournament/components/tournaments-overview";

export function TournamentsPage() {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                header="Turnieje"
                subHeader="Przeglądaj turnieje w grupach, do których należysz"
            />
            <Suspense fallback={<TournamentsOverviewLoading />}>
                <TournamentsOverview />
            </Suspense>
        </div>
    );
}
