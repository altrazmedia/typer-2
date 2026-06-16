import type { FC } from "react";

import { EmptyContentMessage } from "@/components/ui/empty-content-message";
import {
    FinishedGameCard,
    FinishedGameCardLoading,
} from "@/features/game/components/finished-game-card";
import { classifyGames } from "@/features/tournament/helpers/classify-games";
import { getTournamentGames } from "@/features/tournament/server/get-tournament-games";

interface Props {
    currentUserId: string;
    isAdmin: boolean;
    tournamentId: string;
}

export async function TournamentFinishedGamesSection({
    currentUserId,
    isAdmin,
    tournamentId,
}: Props): Promise<React.ReactElement | null> {
    const data = await getTournamentGames(tournamentId, currentUserId);
    if (!data) {
        return null;
    }

    const { finished } = classifyGames(data.games, new Date());

    if (finished.length === 0) {
        return <EmptyContentMessage message="Brak zakończonych meczów." />;
    }

    return (
        <ul className="flex flex-col gap-4">
            {finished.map((game) => (
                <li key={game.id}>
                    <FinishedGameCard
                        game={game}
                        groupMembers={data.groupMembers}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                    />
                </li>
            ))}
        </ul>
    );
}

export const TournamentFinishedGamesSectionLoading: FC = () => {
    return (
        <ul className="flex flex-col gap-4">
            <li>
                <FinishedGameCardLoading />
            </li>
            <li>
                <FinishedGameCardLoading />
            </li>
            <li>
                <FinishedGameCardLoading />
            </li>
        </ul>
    );
};
