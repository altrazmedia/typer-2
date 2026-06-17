import type { FC } from "react";

import {
    LeaderboardTable,
    LeaderboardTableLoading,
} from "@/features/tournament/components/leaderboard-table";
import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";
import { getTournamentMeta } from "@/features/tournament/server/get-tournament-meta";

interface Props {
    tournamentId: string;
}

export async function TournamentLeaderboardSection({
    tournamentId,
}: Props): Promise<React.ReactElement | null> {
    const [leaderboard, meta] = await Promise.all([
        getTournamentLeaderboard(tournamentId),
        getTournamentMeta(tournamentId),
    ]);

    if (!meta) {
        return null;
    }

    return (
        <LeaderboardTable
            leaderboard={leaderboard ?? []}
            exactScorePoints={meta.exactScorePoints}
            correctOutcomePoints={meta.correctOutcomePoints}
        />
    );
}

export const TournamentLeaderboardSectionLoading: FC = () => {
    return <LeaderboardTableLoading />;
};
