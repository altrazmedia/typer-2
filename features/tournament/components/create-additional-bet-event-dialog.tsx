"use client";

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

interface Props {
    tournamentId: string;
}

export const CreateAdditionalBetEventDialog: FC<Props> = ({ tournamentId }) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);

    function handleOpenChange(nextOpen: boolean): void {
        setOpen(nextOpen);
        if (!nextOpen) {
            setFormKey((key) => key + 1);
        }
    }

    function handleSuccess(): void {
        setOpen(false);
        router.refresh();
    }

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)}>
                Dodaj nowy zakład
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nowy dodatkowy zakład</DialogTitle>
                        <DialogDescription>
                            Podaj nazwę, termin i liczbę punktów za trafioną
                            odpowiedź.
                        </DialogDescription>
                    </DialogHeader>
                    <SaveAdditionalBetEventForm
                        key={formKey}
                        tournamentId={tournamentId}
                        onSuccess={handleSuccess}
                        onCancel={() => handleOpenChange(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
