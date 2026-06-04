import type { FC } from "react";
import { Suspense } from "react";

import { EmptyContentMessage } from "@/components/ui/empty-content-message";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { CreateGameDialog } from "@/features/game/components/create-game-dialog";
import { FinishedGameCard } from "@/features/game/components/finished-game-card";
import { UpcomingGameCard } from "@/features/game/components/upcoming-game-card";
import { EditTournamentDialog } from "@/features/tournament/components/edit-tournament-dialog";
import { LeaderboardTable } from "@/features/tournament/components/leaderboard-table";
import type { TournamentGamesTab } from "@/features/tournament/helpers/parse-tournament-games-tab";
import type { TournamentDetail } from "@/features/tournament/server/get-tournament-detail";
import type { LeaderboardEntry } from "@/features/tournament/types";
import { PageHeader } from "@/components/ui/page-header";

type TournamentGameRow = TournamentDetail["tournament"]["games"][number];

interface Props {
    activeTab: TournamentGamesTab;
    currentUserId: string;
    detail: TournamentDetail;
    finishedGames: TournamentGameRow[];
    leaderboard: LeaderboardEntry[];
    upcomingGames: TournamentGameRow[];
}

export const TournamentDetailView: FC<Props> = ({
    activeTab,
    currentUserId,
    detail,
    finishedGames,
    leaderboard,
    upcomingGames,
}) => {
    const { tournament, groupMembers, isAdmin } = detail;
    const exactPts = tournament.exactScorePoints;
    const outcomePts = tournament.correctOutcomePoints;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader header={tournament.name} />
            {isAdmin ? (
                <div className="flex flex-row justify-end gap-2">
                    <EditTournamentDialog
                        tournamentId={tournament.id}
                        initialName={tournament.name}
                        initialSeason={tournament.season}
                        initialExactScorePoints={exactPts}
                        initialCorrectOutcomePoints={outcomePts}
                    />
                    <CreateGameDialog tournamentId={tournament.id} />
                </div>
            ) : null}

            <div className="flex flex-col gap-4">
                <Suspense
                    fallback={
                        <div className="inline-flex h-8 w-fit min-w-[200px] rounded-lg bg-muted p-[3px]" />
                    }
                >
                    <TabNavigation
                        activeTab={activeTab}
                        tabs={[
                            { label: "Nadchodzące mecze", value: "upcoming" },
                            { label: "Zakończone mecze", value: "finished" },
                            { label: "Tabela", value: "leaderboard" },
                        ]}
                    />
                </Suspense>
                {activeTab === "leaderboard" ? (
                    <LeaderboardTable
                        leaderboard={leaderboard}
                        exactScorePoints={exactPts}
                        correctOutcomePoints={outcomePts}
                    />
                ) : activeTab === "upcoming" ? (
                    upcomingGames.length === 0 ? (
                        <EmptyContentMessage message="Brak nadchodzących meczów." />
                    ) : (
                        <ul className="flex flex-col gap-4">
                            {upcomingGames.map((game) => {
                                const currentUserBet =
                                    game.bets.find(
                                        (bet) => bet.userId === currentUserId,
                                    ) ?? null;

                                return (
                                    <li key={game.id}>
                                        <UpcomingGameCard
                                            game={{
                                                id: game.id,
                                                homeTeam: game.homeTeam,
                                                awayTeam: game.awayTeam,
                                                kickoffAt: game.kickoffAt,
                                                homeScore: game.homeScore,
                                                awayScore: game.awayScore,
                                            }}
                                            userBet={
                                                currentUserBet
                                                    ? {
                                                          homeScore:
                                                              currentUserBet.homeScore,
                                                          awayScore:
                                                              currentUserBet.awayScore,
                                                      }
                                                    : null
                                            }
                                            isAdmin={isAdmin}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )
                ) : activeTab === "finished" && finishedGames.length === 0 ? (
                    <EmptyContentMessage message="Brak zakończonych meczów." />
                ) : activeTab === "finished" ? (
                    <ul className="flex flex-col gap-4">
                        {finishedGames.map((game) => (
                            <li key={game.id}>
                                <FinishedGameCard
                                    game={{
                                        id: game.id,
                                        homeTeam: game.homeTeam,
                                        awayTeam: game.awayTeam,
                                        kickoffAt: game.kickoffAt,
                                        homeScore: game.homeScore,
                                        awayScore: game.awayScore,
                                    }}
                                    groupMembers={groupMembers}
                                    gameBets={game.bets}
                                    currentUserId={currentUserId}
                                    isAdmin={isAdmin}
                                />
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );
};
