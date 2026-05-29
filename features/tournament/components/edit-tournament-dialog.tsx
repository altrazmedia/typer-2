"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    tournamentId: string;
    initialName: string;
    initialSeason: string | null;
    initialExactScorePoints: number;
    initialCorrectOutcomePoints: number;
}

export const EditTournamentDialog: FC<Props> = ({
    tournamentId,
    initialName,
    initialSeason,
    initialExactScorePoints,
    initialCorrectOutcomePoints,
}) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setPending(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = String(formData.get("name") ?? "").trim();
        const seasonRaw = String(formData.get("season") ?? "").trim();
        const exactScorePoints = Number(formData.get("exactScorePoints"));
        const correctOutcomePoints = Number(
            formData.get("correctOutcomePoints"),
        );

        const res = await fetch(`/api/tournaments/${tournamentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                season: seasonRaw.length ? seasonRaw : null,
                exactScorePoints: Number.isFinite(exactScorePoints)
                    ? exactScorePoints
                    : undefined,
                correctOutcomePoints: Number.isFinite(correctOutcomePoints)
                    ? correctOutcomePoints
                    : undefined,
            }),
        });

        setPending(false);

        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
            };
            setError(data.error ?? "Nie udało się zapisać zmian.");
            return;
        }

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
            >
                Edytuj turniej
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edycja turnieju</DialogTitle>
                        <DialogDescription>
                            Zmień nazwę, sezon lub zasady punktacji.
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
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-tournament-name">
                                Nazwa turnieju
                            </Label>
                            <Input
                                id="edit-tournament-name"
                                name="name"
                                required
                                disabled={pending}
                                defaultValue={initialName}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-tournament-season">
                                Sezon (opcjonalnie)
                            </Label>
                            <Input
                                id="edit-tournament-season"
                                name="season"
                                disabled={pending}
                                defaultValue={initialSeason ?? ""}
                                placeholder="np. 2025/2026"
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-exact-points">
                                    Punkty za dokładny wynik
                                </Label>
                                <Input
                                    id="edit-exact-points"
                                    name="exactScorePoints"
                                    type="number"
                                    min={0}
                                    step={1}
                                    required
                                    disabled={pending}
                                    defaultValue={initialExactScorePoints}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-outcome-points">
                                    Punkty za trafiony wynik
                                </Label>
                                <Input
                                    id="edit-outcome-points"
                                    name="correctOutcomePoints"
                                    type="number"
                                    min={0}
                                    step={1}
                                    required
                                    disabled={pending}
                                    defaultValue={initialCorrectOutcomePoints}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={pending}
                                onClick={() => setOpen(false)}
                            >
                                Anuluj
                            </Button>
                            <Button type="submit" disabled={pending}>
                                {pending ? "Zapisywanie…" : "Zapisz"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
