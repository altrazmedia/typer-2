import type { FC } from "react";

import { EmptyContentMessage } from "@/components/ui/empty-content-message";
import {
    UpcomingGameCard,
    UpcomingGameCardLoading,
} from "@/features/game/components/upcoming-game-card";
import { classifyGames } from "@/features/tournament/helpers/classify-games";
import { getTournamentGames } from "@/features/tournament/server/get-tournament-games";

interface Props {
    currentUserId: string;
    isAdmin: boolean;
    tournamentId: string;
}

export async function TournamentUpcomingGamesSection({
    currentUserId,
    isAdmin,
    tournamentId,
}: Props): Promise<React.ReactElement | null> {
    const data = await getTournamentGames(tournamentId, currentUserId);
    if (!data) {
        return null;
    }

    const { upcoming } = classifyGames(data.games, new Date());

    if (upcoming.length === 0) {
        return <EmptyContentMessage message="Brak nadchodzących meczów." />;
    }

    return (
        <ul className="flex flex-col gap-4">
            {upcoming.map((game) => (
                <li key={game.id}>
                    <UpcomingGameCard
                        game={game}
                        userBet={game.currentUserBet}
                        isAdmin={isAdmin}
                    />
                </li>
            ))}
        </ul>
    );
}

export const TournamentUpcomingGamesSectionLoading: FC = () => {
    return (
        <ul className="flex flex-col gap-4">
            <li>
                <UpcomingGameCardLoading />
            </li>
            <li>
                <UpcomingGameCardLoading />
            </li>
            <li>
                <UpcomingGameCardLoading />
            </li>
        </ul>
    );
};
