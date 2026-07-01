"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SaveAdditionalBetEventForm } from "@/features/tournament/components/save-additional-bet-event-form";
import type { AdditionalBetEventItem } from "@/features/tournament/types";
import { toDatetimeLocalValue } from "@/lib/datetime-local";

interface Props {
    event: AdditionalBetEventItem;
}

export const EditAdditionalBetEventDialog: FC<Props> = ({ event }) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleOpenChange(nextOpen: boolean): void {
        setOpen(nextOpen);
    }

    function handleSuccess(): void {
        setOpen(false);
        router.refresh();
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                aria-label="Edytuj wydarzenie"
            >
                <Pencil className="size-4" />
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edycja dodatkowego zakładu</DialogTitle>
                        <DialogDescription>
                            Zmień nazwę, termin, punkty lub poprawną odpowiedź.
                        </DialogDescription>
                    </DialogHeader>
                    <SaveAdditionalBetEventForm
                        idPrefix={`edit-${event.id}`}
                        tournamentId={event.tournamentId}
                        defaultValues={{
                            id: event.id,
                            name: event.name,
                            deadline: toDatetimeLocalValue(event.deadline),
                            points: event.points,
                            answer: event.answer,
                        }}
                        onSuccess={handleSuccess}
                        onCancel={() => handleOpenChange(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
