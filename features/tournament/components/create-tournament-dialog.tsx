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
    groupId: string;
    groupName: string;
}

export const CreateTournamentDialog: FC<Props> = ({ groupId, groupName }) => {
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

        const res = await fetch("/api/tournaments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                groupId,
                name,
                season: seasonRaw.length ? seasonRaw : null,
                exactScorePoints: Number.isFinite(exactScorePoints)
                    ? exactScorePoints
                    : 3,
                correctOutcomePoints: Number.isFinite(correctOutcomePoints)
                    ? correctOutcomePoints
                    : 1,
            }),
        });

        setPending(false);

        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
            };
            setError(data.error ?? "Nie udało się utworzyć turnieju.");
            return;
        }

        setOpen(false);
        form.reset();
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
                Dodaj turniej
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nowy turniej</DialogTitle>
                        <DialogDescription>
                            Grupa:{" "}
                            <span className="font-medium text-foreground">
                                {groupName}
                            </span>
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
                            <Label htmlFor="tournament-name">
                                Nazwa turnieju
                            </Label>
                            <Input
                                id="tournament-name"
                                name="name"
                                required
                                disabled={pending}
                                placeholder="np. Mistrzostwa świata 2026"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tournament-season">
                                Sezon (opcjonalnie)
                            </Label>
                            <Input
                                id="tournament-season"
                                name="season"
                                disabled={pending}
                                placeholder="np. 2025/2026"
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="exact-points">
                                    Punkty za dokładny wynik
                                </Label>
                                <Input
                                    id="exact-points"
                                    name="exactScorePoints"
                                    type="number"
                                    min={0}
                                    step={1}
                                    defaultValue={3}
                                    required
                                    disabled={pending}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="outcome-points">
                                    Punkty za trafiony wynik
                                </Label>
                                <Input
                                    id="outcome-points"
                                    name="correctOutcomePoints"
                                    type="number"
                                    min={0}
                                    step={1}
                                    defaultValue={1}
                                    required
                                    disabled={pending}
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
                                {pending ? "Tworzenie…" : "Utwórz turniej"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
