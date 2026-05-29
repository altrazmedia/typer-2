import type { FC } from "react";

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { BetForm } from "@/features/bet/components/bet-form";
import type { BetRow } from "@/features/bet/types";
import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import type { GameRow } from "@/features/game/types";

interface Props {
  game: GameRow;
  userBet: BetRow | null;
  isAdmin: boolean;
}

function formatKickoff(d: Date): string {
  return new Date(d).toLocaleString("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const UpcomingGameCard: FC<Props> = ({ game, userBet, isAdmin }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="flex min-w-0 flex-1 flex-col gap-3 items-center">
          <p className="text-sm text-muted-foreground">{formatKickoff(game.kickoffAt)}</p>
          <CardTitle className="block w-full font-semibold tracking-normal">
            <div className="w-full flex gap-2 items-center justify-center font-bold leading-snug tracking-normal">
              <span className="truncate w-full text-end">{game.homeTeam}</span>
              <BetForm
                gameId={game.id}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                userBet={userBet}
              />
              <span className="truncate w-full">{game.awayTeam}</span>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
        {isAdmin ? (
          <CardFooter>
            <EditGameDialog
              gameId={game.id}
              initialHomeTeam={game.homeTeam}
              initialAwayTeam={game.awayTeam}
              initialKickoffAt={game.kickoffAt}
            />
          </CardFooter>
        ) : null}
    </Card>
  );
};
