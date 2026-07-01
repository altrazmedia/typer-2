"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { placeAdditionalBetAction } from "@/features/tournament/actions/place-additional-bet";

interface Props {
    eventId: string;
    currentUserBet: string | null;
}

export const AdditionalBetEventForm: FC<Props> = ({
    eventId,
    currentUserBet,
}) => {
    const router = useRouter();
    const [answer, setAnswer] = useState(currentUserBet ?? "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await placeAdditionalBetAction({
                eventId,
                answer,
            });

            if (!result.isSuccess) {
                setError(result.errorMessage);
                return;
            }

            router.refresh();
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-start gap-3 sm:flex-row"
        >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Input
                    type="text"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Twój typ"
                    disabled={isPending}
                    aria-label="Twój typ"
                />
                {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : null}
            </div>
            <Button type="submit" disabled={isPending} className="shrink-0">
                {isPending ? "Zapisywanie…" : "Zapisz"}
            </Button>
        </form>
    );
};
