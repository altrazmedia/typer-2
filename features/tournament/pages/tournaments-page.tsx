import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import { TournamentsOverview } from "@/features/tournament/components/tournaments-overview";
import { TournamentsOverviewFallback } from "@/features/tournament/components/tournaments-overview-fallback";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";

export function TournamentsPage() {
    return (
        <Suspense fallback={<TournamentsOverviewFallback />}>
            <TournamentsPageContent />
        </Suspense>
    );
}

export async function TournamentsPageContent() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const sections = await listTournamentsForUser(session.user.id);

    return <TournamentsOverview sections={sections} />;
}
