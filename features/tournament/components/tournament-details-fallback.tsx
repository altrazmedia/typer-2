import type { FC } from "react";

export const TournamentDetailsFallback: FC = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-48 animate-pulse rounded-lg bg-muted sm:h-12 lg:h-14" />
            </div>
            <div className="flex flex-col gap-4">
                <div className="inline-flex h-8 w-fit min-w-[200px] animate-pulse rounded-lg bg-muted p-[3px]" />
                <p className="text-sm text-muted-foreground">Ładowanie…</p>
            </div>
        </div>
    );
};
