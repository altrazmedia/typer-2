"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FC } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createGameAction } from "@/features/game/actions/create-game-action";
import { GameForm } from "@/features/game/components/game-form";
import type { GameParams } from "@/features/game/types";

interface Props {
    tournamentId: string;
}

export const CreateGameDialog: FC<Props> = ({ tournamentId }) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setFormKey((key) => key + 1);
            setError(null);
        }
    }

    function handleSubmit(data: GameParams) {
        setError(null);

        startTransition(async () => {
            const result = await createGameAction({
                tournamentId,
                ...data,
            });

            if (!result.isSuccess) {
                setError(result.errorMessage);
                return;
            }

            setOpen(false);
            router.refresh();
        });
    }

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)}>
                Dodaj mecz
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nowy mecz</DialogTitle>
                        <DialogDescription>
                            Podaj drużyny i termin pierwszego gwizdka.
                        </DialogDescription>
                    </DialogHeader>
                    <GameForm
                        key={formKey}
                        isPending={isPending}
                        error={error}
                        onSubmit={handleSubmit}
                        onCancel={() => handleOpenChange(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
