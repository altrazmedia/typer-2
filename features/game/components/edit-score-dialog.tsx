"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { ScoreForm } from "@/features/game/components/score-form";

interface Props {
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    initialHomeScore: number | null;
    initialAwayScore: number | null;
}

export const EditScoreDialog: FC<Props> = ({
    gameId,
    homeTeam,
    awayTeam,
    initialHomeScore,
    initialAwayScore,
}) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [homeScore, setHomeScore] = useState<number | null>(initialHomeScore);
    const [awayScore, setAwayScore] = useState<number | null>(initialAwayScore);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetFormFromProps = useCallback(() => {
        setHomeScore(initialHomeScore);
        setAwayScore(initialAwayScore);
        setError(null);
    }, [initialHomeScore, initialAwayScore]);

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (next) {
            resetFormFromProps();
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (homeScore === null || awayScore === null) {
            setError("Wybierz wynik dla obu drużyn.");
            return;
        }

        setPending(true);

        const res = await fetch(`/api/games/${gameId}/result`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ homeScore, awayScore }),
        });

        setPending(false);

        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
            };
            setError(data.error ?? "Nie udało się zapisać wyniku.");
            return;
        }

        setOpen(false);
        router.refresh();
    }

    const canSubmit = homeScore !== null && awayScore !== null;

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                    resetFormFromProps();
                    setOpen(true);
                }}
            >
                Edytuj wynik
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edytuj wynik</DialogTitle>
                        <DialogDescription>
                            {homeTeam}{" "}
                            <span className="text-muted-foreground">vs</span>{" "}
                            {awayTeam}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        {error ? (
                            <p
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {error}
                            </p>
                        ) : null}
                        <ScoreForm
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                            homeScore={homeScore}
                            awayScore={awayScore}
                            onHomeChange={setHomeScore}
                            onAwayChange={setAwayScore}
                            disabled={pending}
                        />
                        <DialogFooter className="gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={pending}
                                onClick={() => setOpen(false)}
                            >
                                Anuluj
                            </Button>
                            <Button
                                type="submit"
                                disabled={pending || !canSubmit}
                            >
                                {pending ? "Zapisywanie…" : "Zapisz wynik"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
