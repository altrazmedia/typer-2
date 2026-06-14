import Link from "next/link";
import type { FC } from "react";

import { Card, CardHeader } from "@/components/ui/card";

interface Props {
    tournamentId: string;
    name: string;
}

export const TournamentCard: FC<Props> = ({ tournamentId, name }) => {
    return (
        <Link
            href={`/tournaments/${tournamentId}`}
            className="group block w-full rounded-xl"
        >
            <Card className="flex h-full flex-col bg-linear-to-b from-primary to-primary/90 transition-[background-image] duration-300 group-hover:to-primary/80">
                <CardHeader className="flex flex-1 flex-col justify-center gap-2">
                    <h2 className="my-4 text-center text-xl font-semibold text-primary-foreground">
                        {name}
                    </h2>
                </CardHeader>
            </Card>
        </Link>
    );
};

export const TournamentCardLoading: FC = () => (
    <div className="h-[92px] animate-pulse flex-col rounded-xl bg-primary/90"></div>
);
