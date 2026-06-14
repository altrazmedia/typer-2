import type { FC } from "react";

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { FinishedGameBetsSection } from "@/features/game/components/finished-game-bets-section";
import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import { EditScoreDialog } from "@/features/game/components/edit-score-dialog";
import { KickoffDate } from "@/features/game/components/kickoff-date";
import { buildGameBetRows } from "@/features/game/helpers/build-game-bet-rows";
import type {
    GameBetRow,
    GameRow,
    GroupMemberRow,
} from "@/features/game/types";

interface Props {
    game: GameRow;
    groupMembers: GroupMemberRow[];
    gameBets: GameBetRow[];
    currentUserId: string;
    isAdmin: boolean;
}

export const FinishedGameCard: FC<Props> = ({
    game,
    groupMembers,
    gameBets,
    currentUserId,
    isAdmin,
}) => {
    const betRows = buildGameBetRows(groupMembers, gameBets, currentUserId);

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                        <KickoffDate date={game.kickoffAt} />
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
            <FinishedGameBetsSection rows={betRows} />
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
