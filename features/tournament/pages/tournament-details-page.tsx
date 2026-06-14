import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAuthInApp } from "@/lib/auth/get-auth-in-app";

import { TournamentDetailView } from "@/features/tournament/components/tournament-detail";
import { TournamentDetailsFallback } from "@/features/tournament/components/tournament-details-fallback";
import { classifyGames } from "@/features/tournament/helpers/classify-games";
import { parseTournamentGamesTab } from "@/features/tournament/helpers/parse-tournament-games-tab";
import { getTournamentDetailForUser } from "@/features/tournament/server/get-tournament-detail";
import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string | string[] }>;
}

export function TournamentDetailsPage({ params, searchParams }: Props) {
    return (
        <Suspense fallback={<TournamentDetailsFallback />}>
            <TournamentDetailsContent
                params={params}
                searchParams={searchParams}
            />
        </Suspense>
    );
}

export async function TournamentDetailsContent({
    params,
    searchParams,
}: Props) {
    const { id: tournamentId } = await params;
    const { tab: tabParam } = await searchParams;
    const session = await getAuthInApp();

    const detail = await getTournamentDetailForUser(
        tournamentId,
        session.user.id,
    );
    if (!detail) {
        notFound();
    }

    const activeTab = parseTournamentGamesTab(tabParam);
    const { upcoming: upcomingGames, finished: finishedGames } = classifyGames(
        detail.tournament.games,
        new Date(),
    );

    const leaderboard =
        activeTab === "leaderboard"
            ? await getTournamentLeaderboard(tournamentId)
            : null;

    return (
        <TournamentDetailView
            detail={detail}
            currentUserId={session.user.id}
            activeTab={activeTab}
            finishedGames={finishedGames}
            upcomingGames={upcomingGames}
            leaderboard={leaderboard ?? []}
        />
    );
}
