"use client";

import dayjs from "dayjs";
import type { FC } from "react";
import { useEffect, useState } from "react";

function formatKickoff(d: Date): string {
    return dayjs(d).format("DD.MM.YYYY - HH:mm");
}

interface Props {
    date: Date;
}

export const KickoffDate: FC<Props> = ({ date }) => {
    const [label, setLabel] = useState<string | null>(null);

    useEffect(() => {
        setLabel(formatKickoff(date));
    }, [date]);

    return (
        <span className={label === null ? "invisible" : undefined}>
            {label ?? "—"}
        </span>
    );
};
