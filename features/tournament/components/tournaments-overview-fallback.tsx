import type { FC } from "react";

export const TournamentsOverviewFallback: FC = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-muted sm:h-12 lg:h-14" />
                <div className="h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="flex flex-col gap-4">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-px w-full bg-border" />
                <div className="flex flex-col gap-3">
                    <div className="h-16 animate-pulse rounded-lg bg-muted" />
                    <div className="h-16 animate-pulse rounded-lg bg-muted" />
                </div>
            </div>
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
        </div>
    );
};
