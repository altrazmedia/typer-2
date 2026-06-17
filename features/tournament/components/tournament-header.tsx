import type { FC } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { CreateGameDialog } from "@/features/game/components/create-game-dialog";
import { EditTournamentDialog } from "@/features/tournament/components/edit-tournament-dialog";
import { getTournamentMeta } from "@/features/tournament/server/get-tournament-meta";

interface Props {
    isAdmin: boolean;
    tournamentId: string;
}

export async function TournamentHeader({
    isAdmin,
    tournamentId,
}: Props): Promise<React.ReactElement | null> {
    const tournament = await getTournamentMeta(tournamentId);
    if (!tournament) {
        return null;
    }

    return (
        <>
            <PageHeader header={tournament.name} />
            {isAdmin ? (
                <div className="flex flex-row justify-end gap-2">
                    <EditTournamentDialog
                        tournamentId={tournament.id}
                        initialName={tournament.name}
                        initialSeason={tournament.season}
                        initialExactScorePoints={tournament.exactScorePoints}
                        initialCorrectOutcomePoints={
                            tournament.correctOutcomePoints
                        }
                    />
                    <CreateGameDialog tournamentId={tournament.id} />
                </div>
            ) : null}
        </>
    );
}

export const TournamentHeaderLoading: FC = () => {
    return (
        <div className="relative">
            <div className="absolute h-full w-full animate-pulse rounded-lg bg-muted" />
            <div className="invisible">
                <PageHeader header="Ładowanie turnieju" />
            </div>
        </div>
    );
};
