import { CalendarIcon, TrophyIcon } from "lucide-react";
import type { FC } from "react";

import { EventDate } from "@/components/event-date";
import { AdditionalBetEventBetsToggle } from "@/features/tournament/components/additional-bet-event-bets-toggle";
import { AdditionalBetEventForm } from "@/features/tournament/components/additional-bet-event-form";
import { EditAdditionalBetEventDialog } from "@/features/tournament/components/edit-additional-bet-event-dialog";
import type { AdditionalBetEventItem } from "@/features/tournament/types";

interface Props {
    event: AdditionalBetEventItem;
    isAdmin: boolean;
}

export const AdditionalBetEventCard: FC<Props> = ({ event, isAdmin }) => {
    const isDeadlinePassed = event.deadline <= new Date();

    return (
        <div className="flex w-full flex-col items-start gap-3">
            {isAdmin ? (
                <div className="flex w-full justify-end">
                    <EditAdditionalBetEventDialog event={event} />
                </div>
            ) : null}
            <h3 className="font-heading text-lg font-semibold sm:text-xl">
                {event.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 shrink-0" aria-hidden />
                    {isDeadlinePassed ? (
                        "Zakończone"
                    ) : (
                        <EventDate date={event.deadline} />
                    )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <TrophyIcon className="size-3.5 shrink-0" aria-hidden />
                    {event.points} pkt
                </span>
            </div>
            {isDeadlinePassed ? (
                <p className="text-sm text-muted-foreground">
                    Twój typ:{" "}
                    <span className="font-bold text-foreground">
                        {event.currentUserBet ?? "-"}
                    </span>
                </p>
            ) : (
                <AdditionalBetEventForm
                    eventId={event.id}
                    currentUserBet={event.currentUserBet}
                />
            )}
            {isDeadlinePassed && (
                <AdditionalBetEventBetsToggle
                    otherUsersBets={event.otherUsersBets}
                    answer={event.answer}
                />
            )}
        </div>
    );
};

export const AdditionalBetEventCardLoading: FC = () => {
    return (
        <div className="flex w-full flex-col items-start gap-3">
            <div className="h-5 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="flex gap-4">
                <div className="h-4 w-28 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
    );
};
