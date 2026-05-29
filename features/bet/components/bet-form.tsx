"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FC } from "react";

import {
  Popover,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { BetRow } from "@/features/bet/types";
import { ScoreForm } from "@/features/game/components/score-form";
import { showErrorToast } from "@/lib/toast";
import { useIsMobile } from "@/lib/useIsMobile";
import { cn } from "@/lib/utils";

interface Props {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  userBet: BetRow | null;
}

function formatBetLine(home: number, away: number): string {
  return `${home} - ${away}`;
}

const triggerClassName = cn(
  "flex h-11 shrink-0 min-w-[4.75rem] items-center justify-center rounded-lg border bg-background px-3 font-heading text-base font-semibold tabular-nums ring-offset-background hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

export const BetForm: FC<Props> = ({ gameId, homeTeam, awayTeam, userBet }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const skipNextSyncFromServerRef = useRef(false);
  const [open, setOpen] = useState(false);

  const [committed, setCommitted] = useState<BetRow | null>(() =>
    userBet ? { ...userBet } : null,
  );
  const [homeScore, setHomeScore] = useState<number | null>(() => userBet?.homeScore ?? null);
  const [awayScore, setAwayScore] = useState<number | null>(() => userBet?.awayScore ?? null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      return;
    }
    if (skipNextSyncFromServerRef.current) {
      skipNextSyncFromServerRef.current = false;
      return;
    }
    const nextCommitted = userBet ? { ...userBet } : null;
    setCommitted(nextCommitted);
    setHomeScore(nextCommitted?.homeScore ?? null);
    setAwayScore(nextCommitted?.awayScore ?? null);
  }, [open, userBet]);

  const persistBet = useCallback(
    async (nextHome: number, nextAway: number) => {
      setPending(true);
      try {
        const res = await fetch("/api/bets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId,
            homeScore: nextHome,
            awayScore: nextAway,
          }),
        });

        if (!res.ok) {
          showErrorToast("Nie udało się zapisać zakładu.");
          return;
        }

        const nextCommitted: BetRow = { homeScore: nextHome, awayScore: nextAway };
        setCommitted(nextCommitted);
        skipNextSyncFromServerRef.current = true;
        router.refresh();
      } finally {
        setPending(false);
      }
    },
    [gameId, router],
  );

  function handleOpenChange(next: boolean): void {
    if (next) {
      const c = committed;
      setHomeScore(c?.homeScore ?? null);
      setAwayScore(c?.awayScore ?? null);
      setOpen(true);
      return;
    }

    const c = committed;
    if (
      homeScore !== null &&
      awayScore !== null &&
      (c === null || homeScore !== c.homeScore || awayScore !== c.awayScore)
    ) {
      void persistBet(homeScore, awayScore);
    }
    setOpen(false);
  }

  const triggerLabel =
    committed !== null ? formatBetLine(committed.homeScore, committed.awayScore) : "? - ?";

  const scorePicker = (
    <ScoreForm
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      homeScore={homeScore}
      awayScore={awayScore}
      onHomeChange={setHomeScore}
      onAwayChange={setAwayScore}
      disabled={pending}
    />
  );

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Twój typ: ${triggerLabel}`}
          disabled={pending}
          className={triggerClassName}
          data-open={open ? "" : undefined}
          onClick={() => handleOpenChange(true)}
        >
          {triggerLabel}
        </button>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent aria-label="Obstaw wynik" className="gap-5 pt-3">
            {scorePicker}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label={`Twój typ: ${triggerLabel}`}
        disabled={pending}
        className={triggerClassName}
        type="button"
        data-open={open ? "" : undefined}
      >
        {triggerLabel}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner sideOffset={8} align="center">
          <PopoverPopup>{scorePicker}</PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
};
