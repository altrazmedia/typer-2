import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { TournamentDetailView } from "@/features/tournament/components/tournament-detail";
import { classifyGames } from "@/features/tournament/helpers/classify-games";
import { parseTournamentGamesTab } from "@/features/tournament/helpers/parse-tournament-games-tab";
import { getTournamentDetailForUser } from "@/features/tournament/server/get-tournament-detail";
import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string | string[] }>;
}

export async function TournamentDetailsPage({ params, searchParams }: Props) {
    const { id: tournamentId } = await params;
    const { tab: tabParam } = await searchParams;
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

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
            activeTab={activeTab}
            finishedGames={finishedGames}
            upcomingGames={upcomingGames}
            leaderboard={leaderboard ?? []}
        />
    );
}
