import type { FC } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import { EditScoreDialog } from "@/features/game/components/edit-score-dialog";
import type { GameRow } from "@/features/game/types";

interface Props {
  game: GameRow;
  isAdmin: boolean;
}

function formatKickoff(d: Date): string {
  return new Date(d).toLocaleString("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const GameCard: FC<Props> = ({ game, isAdmin }) => {
  const hasResult = game.homeScore !== null && game.awayScore !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {hasResult
              ? `${game.homeTeam} ${game.homeScore} - ${game.awayScore} ${game.awayTeam}`
              : `${game.homeTeam} - ${game.awayTeam}`}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{formatKickoff(game.kickoffAt)}</p>
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
