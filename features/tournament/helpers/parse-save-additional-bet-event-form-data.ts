import dayjs from "dayjs";

interface ParsedSaveAdditionalBetEventFormData {
    id?: string;
    name: string;
    deadline: string;
    points: number;
    answer?: string | null;
}

export function parseSaveAdditionalBetEventFormData(
    formData: FormData,
    isEdit: boolean,
    eventId?: string,
): ParsedSaveAdditionalBetEventFormData | { error: string } {
    const name = String(formData.get("name") ?? "").trim();
    const deadlineLocal = String(formData.get("deadline") ?? "");
    const pointsRaw = String(formData.get("points") ?? "");
    const answerRaw = String(formData.get("answer") ?? "").trim();

    if (!name) {
        return { error: "Podaj nazwę wydarzenia." };
    }

    if (!deadlineLocal) {
        return { error: "Podaj termin." };
    }

    const deadlineParsed = dayjs(deadlineLocal);
    if (!deadlineParsed.isValid()) {
        return { error: "Podaj prawidłowy termin." };
    }

    const points = Number(pointsRaw);
    if (!Number.isInteger(points) || points < 0) {
        return { error: "Podaj prawidłową liczbę punktów." };
    }

    const parsed: ParsedSaveAdditionalBetEventFormData = {
        name,
        deadline: deadlineParsed.toISOString(),
        points,
    };

    if (isEdit) {
        parsed.id = eventId;
        parsed.answer = answerRaw || null;
    } else if (answerRaw) {
        parsed.answer = answerRaw;
    }

    return parsed;
}
