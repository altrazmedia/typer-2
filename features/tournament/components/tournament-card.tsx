import Link from "next/link";
import type { FC } from "react";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface Props {
    tournamentId: string;
    name: string;
    season: string | null;
    gameCount: number;
}

export const TournamentCard: FC<Props> = ({
    tournamentId,
    name,
    season,
    gameCount,
}) => {
    return (
        <Link
            href={`/tournaments/${tournamentId}`}
            className="block rounded-xl"
        >
            <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <CardTitle className="text-base">{name}</CardTitle>
                        {season ? (
                            <Badge variant="secondary" className="shrink-0">
                                {season}
                            </Badge>
                        ) : null}
                    </div>
                    <CardDescription>
                        {gameCount === 1 ? "1 mecz" : `${gameCount} meczów`}
                    </CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
};
