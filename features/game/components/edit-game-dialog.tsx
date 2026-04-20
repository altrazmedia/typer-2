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
import { toDatetimeLocalValue } from "@/lib/datetime-local";

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

    const res = await fetch(`/api/games/${gameId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeam,
        awayTeam,
        kickoffAt: kickoffAt.toISOString(),
      }),
    });

    setPending(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać zmian.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edytuj
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edycja meczu</DialogTitle>
            <DialogDescription>Zmień drużyny lub termin spotkania.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-home-${gameId}`}>Gospodarze</Label>
              <Input
                id={`edit-home-${gameId}`}
                name="homeTeam"
                required
                disabled={pending}
                defaultValue={initialHomeTeam}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-away-${gameId}`}>Goście</Label>
              <Input
                id={`edit-away-${gameId}`}
                name="awayTeam"
                required
                disabled={pending}
                defaultValue={initialAwayTeam}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-kickoff-${gameId}`}>Data i godzina rozpoczęcia</Label>
              <Input
                id={`edit-kickoff-${gameId}`}
                name="kickoffAt"
                type="datetime-local"
                required
                disabled={pending}
                defaultValue={toDatetimeLocalValue(new Date(initialKickoffAt))}
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
                {pending ? "Zapisywanie…" : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
