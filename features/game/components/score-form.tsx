import type { FC } from "react";

import { ScoreInput } from "@/features/game/components/score-input";

interface Props {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    onHomeChange: (value: number) => void;
    onAwayChange: (value: number) => void;
    disabled?: boolean;
}

export const ScoreForm: FC<Props> = ({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    onHomeChange,
    onAwayChange,
    disabled,
}) => (
    <div className="flex flex-col gap-4">
        <ScoreInput
            label={homeTeam}
            value={homeScore}
            onChange={onHomeChange}
            disabled={disabled}
        />
        <ScoreInput
            label={awayTeam}
            value={awayScore}
            onChange={onAwayChange}
            disabled={disabled}
        />
    </div>
);
