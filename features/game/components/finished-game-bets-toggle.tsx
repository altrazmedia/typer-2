"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BetResultIndicator } from "@/features/game/components/bet-result-indicator";
import type { GameBetTableRow } from "@/features/game/types";

interface Props {
    rows: GameBetTableRow[];
}

function formatPrediction(homeScore: number, awayScore: number): string {
    return `${homeScore} - ${awayScore}`;
}

export const FinishedGameBetsToggle: FC<Props> = ({ rows }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex flex-col items-center px-6">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((value) => !value)}
                className="text-muted-foreground"
            >
                {expanded ? "Ukryj typy" : "Pokaż typy"}
                {expanded ? (
                    <ChevronUpIcon className="size-4" />
                ) : (
                    <ChevronDownIcon className="size-4" />
                )}
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
                                <TableCell>
                                    {row.homeScore !== null &&
                                    row.awayScore !== null ? (
                                        <BetResultIndicator
                                            betResult={row.betResult}
                                        />
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : null}
        </div>
    );
};
