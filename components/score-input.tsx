"use client";

import { useId, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SCORE_VALUES = Array.from({ length: 11 }, (_, i) => i);

export const ScoreInput: FC<Props> = ({ label, value, onChange, disabled }) => {
  const groupId = useId();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={groupId}>{label}</Label>
      <div
        id={groupId}
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-1.5"
      >
        {SCORE_VALUES.map((n) => (
          <Button
            key={n}
            type="button"
            size="sm"
            variant={value === n ? "default" : "outline"}
            disabled={disabled}
            className={cn("min-w-8 tabular-nums", value === n && "ring-2 ring-ring/50")}
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  );
};
