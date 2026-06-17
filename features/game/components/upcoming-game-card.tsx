import type { FC } from "react";

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { BetForm } from "@/features/bet/components/bet-form";
import type { BetRow } from "@/features/bet/types";
import { EditGameDialog } from "@/features/game/components/edit-game-dialog";
import { KickoffDate } from "@/features/game/components/kickoff-date";
import type { GameRow } from "@/features/game/types";

interface Props {
    game: GameRow;
    userBet: BetRow | null;
    isAdmin: boolean;
}

export const UpcomingGameCard: FC<Props> = ({ game, userBet, isAdmin }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                        <KickoffDate date={game.kickoffAt} />
                    </p>
                    <CardTitle className="block w-full font-semibold tracking-normal">
                        <div className="flex w-full items-center justify-center gap-2 text-sm leading-snug font-bold tracking-normal sm:text-lg">
                            <span className="w-full truncate text-end">
                                {game.homeTeam}
                            </span>
                            <BetForm
                                gameId={game.id}
                                homeTeam={game.homeTeam}
                                awayTeam={game.awayTeam}
                                userBet={userBet}
                            />
                            <span className="w-full truncate">
                                {game.awayTeam}
                            </span>
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

export const UpcomingGameCardLoading: FC = () => {
    return (
        <Card>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                <div className="h-4 w-24 animate-pulse rounded-lg bg-muted" />
                <div className="flex flex-row items-center justify-center gap-2">
                    <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />

                    <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
                </div>
            </div>
        </Card>
    );
};
