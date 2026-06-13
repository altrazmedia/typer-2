"use client";

import dayjs from "dayjs";
import { useState, type FC, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GameParams } from "@/features/game/types";

interface Props {
    defaultValues?: Partial<GameParams>;
    isPending: boolean;
    error: string | null;
    onSubmit: (data: GameParams) => void;
    onCancel: () => void;
    idPrefix?: string;
}

function parseGameFormData(formData: FormData): GameParams | string {
    const homeTeam = String(formData.get("homeTeam") ?? "").trim();
    const awayTeam = String(formData.get("awayTeam") ?? "").trim();
    const kickoffLocal = String(formData.get("kickoffAt") ?? "");

    if (!homeTeam || !awayTeam) {
        return "Podaj nazwy obu drużyn.";
    }

    if (!kickoffLocal) {
        return "Podaj datę i godzinę rozpoczęcia.";
    }

    const kickoffParsed = dayjs(kickoffLocal);
    if (!kickoffParsed.isValid()) {
        return "Nieprawidłowa data rozpoczęcia.";
    }

    return {
        homeTeam,
        awayTeam,
        kickoffAt: kickoffParsed.toISOString(),
    };
}

export const GameForm: FC<Props> = ({
    defaultValues,
    isPending,
    error,
    onSubmit,
    onCancel,
    idPrefix = "game",
}) => {
    const [validationError, setValidationError] = useState<string | null>(null);
    const displayError = validationError ?? error;

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setValidationError(null);

        const parsed = parseGameFormData(new FormData(e.currentTarget));
        if (typeof parsed === "string") {
            setValidationError(parsed);
            return;
        }

        onSubmit(parsed);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {displayError ? (
                <p className="text-sm text-destructive" role="alert">
                    {displayError}
                </p>
            ) : null}
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-home-team`}>Gospodarze</Label>
                <Input
                    id={`${idPrefix}-home-team`}
                    name="homeTeam"
                    required
                    disabled={isPending}
                    defaultValue={defaultValues?.homeTeam}
                    placeholder="Drużyna A"
                    autoComplete="off"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-away-team`}>Goście</Label>
                <Input
                    id={`${idPrefix}-away-team`}
                    name="awayTeam"
                    required
                    disabled={isPending}
                    defaultValue={defaultValues?.awayTeam}
                    placeholder="Drużyna B"
                    autoComplete="off"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-kickoff-at`}>
                    Data i godzina rozpoczęcia
                </Label>
                <Input
                    id={`${idPrefix}-kickoff-at`}
                    name="kickoffAt"
                    type="datetime-local"
                    required
                    disabled={isPending}
                    defaultValue={defaultValues?.kickoffAt}
                />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={onCancel}
                >
                    Anuluj
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Zapisywanie..." : "Zapisz"}
                </Button>
            </div>
        </form>
    );
};
