"use client";

import dayjs from "dayjs";
import type { FC } from "react";
import { useEffect, useState } from "react";

function formatEventDate(date: Date): string {
    return dayjs(date).format("DD.MM.YYYY • HH:mm");
}

interface Props {
    date: Date;
}

export const EventDate: FC<Props> = ({ date }) => {
    const [label, setLabel] = useState<string | null>(null);

    useEffect(() => {
        setLabel(formatEventDate(date));
    }, [date]);

    return (
        <span className={label === null ? "invisible" : undefined}>
            {label ?? "—"}
        </span>
    );
};
