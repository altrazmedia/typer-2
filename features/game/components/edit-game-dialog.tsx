"use client";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
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
import { updateGameAction } from "@/features/game/actions/update-game-action";
import { GameForm } from "@/features/game/components/game-form";
import type { GameParams } from "@/features/game/types";

dayjs.extend(utc);

interface Props {
    gameId: string;
    initialHomeTeam: string;
    initialAwayTeam: string;
    initialKickoffAt: Date;
}

export const EditGameDialog: FC<Props> = ({
    gameId,
    initialHomeTeam,
    initialAwayTeam,
    initialKickoffAt,
}) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setError(null);
        }
    }

    function handleSubmit(data: GameParams) {
        setError(null);

        startTransition(async () => {
            const result = await updateGameAction({
                gameId,
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
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
            >
                Edytuj
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edycja meczu</DialogTitle>
                        <DialogDescription>
                            Zmień drużyny lub termin spotkania.
                        </DialogDescription>
                    </DialogHeader>
                    <GameForm
                        idPrefix={`edit-${gameId}`}
                        isPending={isPending}
                        error={error}
                        onSubmit={handleSubmit}
                        onCancel={() => handleOpenChange(false)}
                        defaultValues={{
                            homeTeam: initialHomeTeam,
                            awayTeam: initialAwayTeam,
                            kickoffAt: dayjs
                                .utc(initialKickoffAt)
                                .local()
                                .format("YYYY-MM-DDTHH:mm"),
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
