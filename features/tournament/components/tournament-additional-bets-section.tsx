import type { FC } from "react";

import { EmptyContentMessage } from "@/components/ui/empty-content-message";
import { Separator } from "@/components/ui/separator";
import {
    AdditionalBetEventCard,
    AdditionalBetEventCardLoading,
} from "@/features/tournament/components/additional-bet-event-card";
import { CreateAdditionalBetEventDialog } from "@/features/tournament/components/create-additional-bet-event-dialog";
import { getAdditionalBetEvents } from "@/features/tournament/server/get-additional-bet-events";

interface Props {
    currentUserId: string;
    isAdmin: boolean;
    tournamentId: string;
}

export async function TournamentAdditionalBetsSection({
    currentUserId,
    isAdmin,
    tournamentId,
}: Props): Promise<React.ReactElement | null> {
    const events = await getAdditionalBetEvents(tournamentId, currentUserId);
    if (!events) {
        return null;
    }

    const adminActions = isAdmin ? (
        <div className="flex justify-end">
            <CreateAdditionalBetEventDialog tournamentId={tournamentId} />
        </div>
    ) : null;

    if (events.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                {adminActions}
                <EmptyContentMessage message="Brak dodatkowych zakładów w tym turnieju." />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {adminActions}
            <div className="flex flex-col gap-4">
                {events.map((event, index) => (
                    <div key={event.id} className="flex flex-col gap-4">
                        {index > 0 ? <Separator /> : null}
                        <AdditionalBetEventCard
                            event={event}
                            isAdmin={isAdmin}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const TournamentAdditionalBetsSectionLoading: FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <AdditionalBetEventCardLoading />
            <Separator />
            <AdditionalBetEventCardLoading />
        </div>
    );
};
