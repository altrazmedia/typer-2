import type { FC } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { FinishedGameBetsSection } from "@/features/game/components/finished-game-bets-section";
import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import { EditScoreDialog } from "@/features/game/components/edit-score-dialog";
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
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                        {game.homeTeam} {game.homeScore} – {game.awayScore}{" "}
                        {game.awayTeam}
                    </CardTitle>
                </div>
                {isAdmin ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
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
                    </div>
                ) : null}
            </CardHeader>
            <FinishedGameBetsSection rows={betRows} />
        </Card>
    );
};
