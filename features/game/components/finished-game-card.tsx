import type { FC } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import { EditScoreDialog } from "@/features/game/components/edit-score-dialog";
import type { GameRow } from "@/features/game/types";

interface Props {
  game: GameRow;
  isAdmin: boolean;
}

export const FinishedGameCard: FC<Props> = ({ game, isAdmin }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {game.homeTeam} {game.homeScore} – {game.awayScore} {game.awayTeam}
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
    </Card>
  );
};
