import type { FC } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/features/tournament/types";

interface Props {
    leaderboard: LeaderboardEntry[];
    exactScorePoints: number;
    correctOutcomePoints: number;
}

export const LeaderboardTable: FC<Props> = ({
    leaderboard,
    exactScorePoints,
    correctOutcomePoints,
}) => {
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-muted-foreground">
                            #
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                            Gracz
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                            Dokładne wyniki
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                            Poprawne rezultaty
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                            Punkty
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaderboard.map((entry) => (
                        <TableRow key={entry.userId}>
                            <TableCell>{entry.rank}.</TableCell>
                            <TableCell>{entry.name}</TableCell>
                            <TableCell className="text-right">
                                {entry.exactScoreBets}
                            </TableCell>
                            <TableCell className="text-right">
                                {entry.correctOutcomeBets}
                            </TableCell>
                            <TableCell className="text-right">
                                {entry.totalPoints}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <p className="my-4 text-sm text-muted-foreground">
                Punktacja: <br />
                {exactScorePoints} pkt za dokładny wynik, <br />
                {correctOutcomePoints} pkt za trafiony rezultat
            </p>
        </>
    );
};
