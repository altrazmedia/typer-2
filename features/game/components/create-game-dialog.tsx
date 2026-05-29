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
}

export const CreateGameDialog: FC<Props> = ({ tournamentId }) => {
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
        const homeTeam = String(formData.get("homeTeam") ?? "").trim();
        const awayTeam = String(formData.get("awayTeam") ?? "").trim();
        const kickoffLocal = String(formData.get("kickoffAt") ?? "");

        if (!kickoffLocal) {
            setError("Podaj datę i godzinę rozpoczęcia.");
            setPending(false);
            return;
        }

        const kickoffAt = new Date(kickoffLocal);
        if (Number.isNaN(kickoffAt.getTime())) {
            setError("Nieprawidłowa data rozpoczęcia.");
            setPending(false);
            return;
        }

        const res = await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tournamentId,
                homeTeam,
                awayTeam,
                kickoffAt: kickoffAt.toISOString(),
            }),
        });

        setPending(false);

        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
            };
            setError(data.error ?? "Nie udało się dodać meczu.");
            return;
        }

        setOpen(false);
        form.reset();
        router.refresh();
    }

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)}>
                Dodaj mecz
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nowy mecz</DialogTitle>
                        <DialogDescription>
                            Podaj drużyny i termin pierwszego gwizdka.
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
                            <Label htmlFor="home-team">Gospodarze</Label>
                            <Input
                                id="home-team"
                                name="homeTeam"
                                required
                                disabled={pending}
                                placeholder="Drużyna A"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="away-team">Goście</Label>
                            <Input
                                id="away-team"
                                name="awayTeam"
                                required
                                disabled={pending}
                                placeholder="Drużyna B"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="kickoff-at">
                                Data i godzina rozpoczęcia
                            </Label>
                            <Input
                                id="kickoff-at"
                                name="kickoffAt"
                                type="datetime-local"
                                required
                                disabled={pending}
                            />
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
                                {pending ? "Dodawanie…" : "Dodaj mecz"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
