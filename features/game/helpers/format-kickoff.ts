import dayjs from "dayjs";

export function formatKickoff(d: Date): string {
    return dayjs(d).format("DD.MM.YYYY - HH:mm");
}
