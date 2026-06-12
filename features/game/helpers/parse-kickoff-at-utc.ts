import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function parseKickoffAtUtc(value: string): Date {
    const parsed = dayjs.utc(value.trim());
    if (!parsed.isValid()) {
        throw new Error("Podaj prawidłową datę rozpoczęcia meczu.");
    }

    return parsed.toDate();
}
