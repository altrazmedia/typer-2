"use client";

import { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { GameBetTableRow } from "@/features/game/types";

interface Props {
    rows: GameBetTableRow[];
}

function formatPrediction(homeScore: number, awayScore: number): string {
    return `${homeScore} - ${awayScore}`;
}

export const FinishedGameBetsSection: FC<Props> = ({ rows }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-t px-6 py-4">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((value) => !value)}
            >
                {expanded ? "Ukryj typowania" : "Pokaż typowania"}
            </Button>
            {expanded ? (
                <Table className="mt-3">
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.userId}>
                                <TableCell>
                                    {row.isCurrentUser ? (
                                        <span className="font-bold">
                                            {row.name}
                                        </span>
                                    ) : (
                                        row.name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {row.homeScore !== null &&
                                    row.awayScore !== null
                                        ? formatPrediction(
                                              row.homeScore,
                                              row.awayScore,
                                          )
                                        : null}
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : null}
        </div>
    );
};
