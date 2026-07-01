"use client";

import { useState, useTransition, type FC, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAdditionalBetEventAction } from "@/features/tournament/actions/save-additional-bet-event";
import { parseSaveAdditionalBetEventFormData } from "@/features/tournament/helpers/parse-save-additional-bet-event-form-data";

interface SaveAdditionalBetEventFormDefaultValues {
    id?: string;
    name?: string;
    deadline?: string;
    points?: number;
    answer?: string | null;
}

interface Props {
    tournamentId: string;
    defaultValues?: SaveAdditionalBetEventFormDefaultValues;
    onSuccess: () => void;
    onCancel: () => void;
    idPrefix?: string;
}

export const SaveAdditionalBetEventForm: FC<Props> = ({
    tournamentId,
    defaultValues,
    onSuccess,
    onCancel,
    idPrefix = "additional-bet-event",
}) => {
    const isEdit = Boolean(defaultValues?.id);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const displayError = validationError ?? actionError;

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setValidationError(null);
        setActionError(null);

        const parsed = parseSaveAdditionalBetEventFormData(
            new FormData(event.currentTarget),
            isEdit,
            defaultValues?.id,
        );

        if ("error" in parsed) {
            setValidationError(parsed.error);
            return;
        }

        startTransition(async () => {
            const result = await saveAdditionalBetEventAction({
                tournamentId,
                ...parsed,
            });

            if (!result.isSuccess) {
                setActionError(result.errorMessage);
                return;
            }

            onSuccess();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {displayError ? (
                <p className="text-sm text-destructive" role="alert">
                    {displayError}
                </p>
            ) : null}
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-name`}>Nazwa</Label>
                <Input
                    id={`${idPrefix}-name`}
                    name="name"
                    required
                    disabled={isPending}
                    defaultValue={defaultValues?.name}
                    placeholder="Np. Strzelec turnieju"
                    autoComplete="off"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-deadline`}>Termin</Label>
                <Input
                    id={`${idPrefix}-deadline`}
                    name="deadline"
                    type="datetime-local"
                    required
                    disabled={isPending}
                    defaultValue={defaultValues?.deadline}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-points`}>Punkty</Label>
                <Input
                    id={`${idPrefix}-points`}
                    name="points"
                    type="number"
                    min={0}
                    step={1}
                    required
                    disabled={isPending}
                    defaultValue={defaultValues?.points ?? 0}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}-answer`}>
                    Poprawna odpowiedź (opcjonalnie)
                </Label>
                <Input
                    id={`${idPrefix}-answer`}
                    name="answer"
                    disabled={isPending}
                    defaultValue={defaultValues?.answer ?? ""}
                    placeholder="Odpowiedź po zakończeniu terminu"
                    autoComplete="off"
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
