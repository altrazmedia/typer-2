import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { getAuthInApp } from "@/lib/auth/get-auth-in-app";

import {
    TournamentAdditionalBetsSection,
    TournamentAdditionalBetsSectionLoading,
} from "@/features/tournament/components/tournament-additional-bets-section";
import {
    TournamentFinishedGamesSection,
    TournamentFinishedGamesSectionLoading,
} from "@/features/tournament/components/tournament-finished-games-section";
import {
    TournamentUpcomingGamesSection,
    TournamentUpcomingGamesSectionLoading,
} from "@/features/tournament/components/tournament-upcoming-games-section";
import {
    TournamentHeader,
    TournamentHeaderLoading,
} from "@/features/tournament/components/tournament-header";
import {
    TournamentLeaderboardSection,
    TournamentLeaderboardSectionLoading,
} from "@/features/tournament/components/tournament-leaderboard-section";
import { parseTournamentGamesTab } from "@/features/tournament/helpers/parse-tournament-games-tab";
import { getTournamentMembership } from "@/features/tournament/server/get-tournament-membership";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string | string[] }>;
}

export async function TournamentDetailsPage({
    params,
    searchParams,
}: Props): Promise<React.ReactElement> {
    const { id: tournamentId } = await params;
    const { tab: tabParam } = await searchParams;
    const session = await getAuthInApp();
    const activeTab = parseTournamentGamesTab(tabParam);

    const membership = await getTournamentMembership(
        tournamentId,
        session.user.id,
    );
    if (!membership) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <Suspense fallback={<TournamentHeaderLoading />}>
                <TournamentHeader
                    isAdmin={membership.isAdmin}
                    tournamentId={tournamentId}
                />
            </Suspense>

            <div className="flex flex-col gap-4">
                <TabNavigation
                    activeTab={activeTab}
                    tabs={[
                        { label: "Nadchodzące mecze", value: "upcoming" },
                        { label: "Zakończone mecze", value: "finished" },
                        {
                            label: "Dodatkowe zakłady",
                            value: "additional-bets",
                        },
                        { label: "Tabela", value: "leaderboard" },
                    ]}
                />
                {activeTab === "leaderboard" && (
                    <Suspense
                        fallback={<TournamentLeaderboardSectionLoading />}
                    >
                        <TournamentLeaderboardSection
                            tournamentId={tournamentId}
                        />
                    </Suspense>
                )}
                {activeTab === "upcoming" && (
                    <Suspense
                        fallback={<TournamentUpcomingGamesSectionLoading />}
                    >
                        <TournamentUpcomingGamesSection
                            currentUserId={session.user.id}
                            isAdmin={membership.isAdmin}
                            tournamentId={tournamentId}
                        />
                    </Suspense>
                )}
                {activeTab === "finished" && (
                    <Suspense
                        fallback={<TournamentFinishedGamesSectionLoading />}
                    >
                        <TournamentFinishedGamesSection
                            currentUserId={session.user.id}
                            isAdmin={membership.isAdmin}
                            tournamentId={tournamentId}
                        />
                    </Suspense>
                )}
                {activeTab === "additional-bets" && (
                    <Suspense
                        fallback={<TournamentAdditionalBetsSectionLoading />}
                    >
                        <TournamentAdditionalBetsSection
                            currentUserId={session.user.id}
                            isAdmin={membership.isAdmin}
                            tournamentId={tournamentId}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
}
