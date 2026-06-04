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
}

export const LeaderboardTable: FC<Props> = ({ leaderboard }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Miejsce</TableHead>
                    <TableHead>Gracz</TableHead>
                    <TableHead className="text-right">
                        Dokładne wyniki
                    </TableHead>
                    <TableHead className="text-right">
                        Poprawne rezultaty
                    </TableHead>
                    <TableHead className="text-right">Punkty</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leaderboard.map((entry) => (
                    <TableRow key={entry.userId}>
                        <TableCell>{entry.rank}</TableCell>
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
    );
};
