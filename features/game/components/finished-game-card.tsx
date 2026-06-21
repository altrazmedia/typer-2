import type { FC } from "react";

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { FinishedGameBetsSection } from "@/features/game/components/finished-game-bets-section";
import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import { EditScoreDialog } from "@/features/game/components/edit-score-dialog";
import { EventDate } from "@/components/event-date";
import type { GameRow, GroupMemberRow } from "@/features/game/types";

interface Props {
    game: GameRow;
    groupMembers: GroupMemberRow[];
    currentUserId: string;
    isAdmin: boolean;
}

export const FinishedGameCard: FC<Props> = ({
    game,
    groupMembers,
    currentUserId,
    isAdmin,
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                        <EventDate date={game.kickoffAt} />
                    </p>
                    <CardTitle className="text-sm font-bold sm:text-lg">
                        {game.homeTeam}{" "}
                        <span className="text-primary">
                            {game.homeScore} - {game.awayScore}
                        </span>{" "}
                        {game.awayTeam}
                    </CardTitle>
                </div>
            </CardHeader>
            <FinishedGameBetsSection
                gameId={game.id}
                groupMembers={groupMembers}
                currentUserId={currentUserId}
            />
            {isAdmin ? (
                <CardFooter className="flex flex-row gap-2">
                    <EditGameDialog
                        gameId={game.id}
                        initialHomeTeam={game.homeTeam}
                        initialAwayTeam={game.awayTeam}
                        initialKickoffAt={game.kickoffAt}
                    />
                    <EditScoreDialog
                        gameId={game.id}
                        homeTeam={game.homeTeam}
                        awayTeam={game.awayTeam}
                        initialHomeScore={game.homeScore}
                        initialAwayScore={game.awayScore}
                    />
                </CardFooter>
            ) : null}
        </Card>
    );
};

export const FinishedGameCardLoading: FC = () => {
    return (
        <Card>
            <CardHeader className="flex flex-col items-center justify-between gap-5 space-y-0">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                    <div className="h-4 w-24 animate-pulse rounded-lg bg-muted" />
                    <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
                </div>
                <div className="h-4 w-24 animate-pulse rounded-lg bg-muted" />
            </CardHeader>
        </Card>
    );
};
