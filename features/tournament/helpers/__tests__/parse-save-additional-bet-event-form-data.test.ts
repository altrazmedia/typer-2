import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import { parseSaveAdditionalBetEventFormData } from "@/features/tournament/helpers/parse-save-additional-bet-event-form-data";

function makeFormData(fields: Record<string, string>): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        formData.set(key, value);
    }
    return formData;
}

describe("parseSaveAdditionalBetEventFormData", () => {
    const validFields = {
        name: "Strzelec turnieju",
        deadline: "2026-07-01T20:00",
        points: "5",
    };

    it("returns error when name is missing", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, name: "" }),
            false,
        );

        expect(result).toEqual({ error: "Podaj nazwę wydarzenia." });
    });

    it("returns error when name is whitespace only", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, name: "   " }),
            false,
        );

        expect(result).toEqual({ error: "Podaj nazwę wydarzenia." });
    });

    it("returns error when deadline is missing", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, deadline: "" }),
            false,
        );

        expect(result).toEqual({ error: "Podaj termin." });
    });

    it("returns error when deadline is invalid", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, deadline: "not-a-date" }),
            false,
        );

        expect(result).toEqual({ error: "Podaj prawidłowy termin." });
    });

    it("returns error when points are negative", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, points: "-1" }),
            false,
        );

        expect(result).toEqual({ error: "Podaj prawidłową liczbę punktów." });
    });

    it("returns error when points are not an integer", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, points: "2.5" }),
            false,
        );

        expect(result).toEqual({ error: "Podaj prawidłową liczbę punktów." });
    });

    it("returns error when points are not a number", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, points: "abc" }),
            false,
        );

        expect(result).toEqual({ error: "Podaj prawidłową liczbę punktów." });
    });

    it("parses create form data without answer", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData(validFields),
            false,
        );

        expect(result).toEqual({
            name: "Strzelec turnieju",
            deadline: dayjs(validFields.deadline).toISOString(),
            points: 5,
        });
    });

    it("parses create form data with answer", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, answer: "  Lewandowski  " }),
            false,
        );

        expect(result).toEqual({
            name: "Strzelec turnieju",
            deadline: dayjs(validFields.deadline).toISOString(),
            points: 5,
            answer: "Lewandowski",
        });
    });

    it("parses edit form data with id and null answer when empty", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, answer: "" }),
            true,
            "abe_1",
        );

        expect(result).toEqual({
            id: "abe_1",
            name: "Strzelec turnieju",
            deadline: dayjs(validFields.deadline).toISOString(),
            points: 5,
            answer: null,
        });
    });

    it("parses edit form data with answer", () => {
        const result = parseSaveAdditionalBetEventFormData(
            makeFormData({ ...validFields, answer: "Messi" }),
            true,
            "abe_1",
        );

        expect(result).toEqual({
            id: "abe_1",
            name: "Strzelec turnieju",
            deadline: dayjs(validFields.deadline).toISOString(),
            points: 5,
            answer: "Messi",
        });
    });
});
