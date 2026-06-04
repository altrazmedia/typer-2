import { BetResult } from "@prisma/client";
import type { FC } from "react";

import { cn } from "@/lib/utils";

interface Props {
    betResult: BetResult | null;
}

const INDICATOR_CONFIG: Record<
    BetResult,
    { className: string; title: string }
> = {
    [BetResult.EXACT_SCORE]: {
        className: "bg-green-500",
        title: "Dokładny wynik",
    },
    [BetResult.CORRECT_OUTCOME]: {
        className: "bg-yellow-500",
        title: "Poprawny rezultat",
    },
    [BetResult.INCORRECT]: {
        className: "bg-red-500",
        title: "Niepoprawny typ",
    },
};

const UNGRADED_CONFIG = {
    className: "bg-muted-foreground",
    title: "Oczekuje na wynik meczu",
};

export const BetResultIndicator: FC<Props> = ({ betResult }) => {
    const config =
        betResult === null ? UNGRADED_CONFIG : INDICATOR_CONFIG[betResult];

    return (
        <span
            role="img"
            title={config.title}
            aria-label={config.title}
            className={cn(
                "inline-block size-2.5 shrink-0 rounded-full",
                config.className,
            )}
        />
    );
};
