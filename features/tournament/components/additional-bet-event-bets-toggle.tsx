"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { AdditionalBetEventUserBet } from "@/features/tournament/types";

interface Props {
    otherUsersBets: AdditionalBetEventUserBet[];
    answer: string | null;
}

export const AdditionalBetEventBetsToggle: FC<Props> = ({
    otherUsersBets,
    answer,
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex w-full flex-col items-start">
            {answer !== null ? (
                <p className="mb-3 text-sm text-muted-foreground">
                    Poprawna odpowiedź:{" "}
                    <span className="font-bold text-primary">{answer}</span>
                </p>
            ) : null}
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
                        {otherUsersBets.map((row) => (
                            <TableRow key={row.userId}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.answer}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : null}
        </div>
    );
};
