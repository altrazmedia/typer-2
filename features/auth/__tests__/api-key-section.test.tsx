import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiKeySection } from "@/features/auth/components/api-key-section";

import * as toast from "@/lib/toast";
import { mockFetchOnce } from "@/test/fetch";

vi.mock("@/lib/toast", () => ({
    showErrorToast: vi.fn(),
}));

describe("ApiKeySection", () => {
    it("renders description and generate button", () => {
        render(<ApiKeySection />);

        expect(screen.getByText("Klucz API")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Generuj nowy klucz" }),
        ).toBeInTheDocument();
        expect(screen.getAllByText(/X-API-Key/).length).toBeGreaterThan(0);
    });

    it("displays generated key and warning after successful generation", async () => {
        const user = userEvent.setup();
        mockFetchOnce({ status: 200, json: { apiKey: "typ_abc123" } });

        render(<ApiKeySection />);

        await user.click(
            screen.getByRole("button", { name: "Generuj nowy klucz" }),
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue("typ_abc123")).toBeInTheDocument();
        });

        expect(
            screen.getByRole("button", { name: "Skopiuj klucz" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Poprzednie klucze zostały unieważnione/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/nie zostanie pokazany ponownie/),
        ).toBeInTheDocument();
    });

    it("shows error toast when request fails", async () => {
        const user = userEvent.setup();
        mockFetchOnce({
            status: 500,
            json: { error: "Internal Server Error" },
        });

        render(<ApiKeySection />);

        await user.click(
            screen.getByRole("button", { name: "Generuj nowy klucz" }),
        );

        await waitFor(() => {
            expect(toast.showErrorToast).toHaveBeenCalledWith(
                "Nie udało się wygenerować klucza API.",
            );
        });

        expect(screen.queryByDisplayValue(/typ_/)).not.toBeInTheDocument();
    });

    it("shows error toast when fetch throws", async () => {
        const user = userEvent.setup();
        vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
            new Error("Network error"),
        );

        render(<ApiKeySection />);

        await user.click(
            screen.getByRole("button", { name: "Generuj nowy klucz" }),
        );

        await waitFor(() => {
            expect(toast.showErrorToast).toHaveBeenCalledWith(
                "Nie udało się wygenerować klucza API.",
            );
        });
    });

    it("copies key to clipboard on copy button click", async () => {
        const user = userEvent.setup();
        mockFetchOnce({ status: 200, json: { apiKey: "typ_testkey" } });

        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText },
            configurable: true,
        });

        render(<ApiKeySection />);

        await user.click(
            screen.getByRole("button", { name: "Generuj nowy klucz" }),
        );

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Skopiuj klucz" }),
            ).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: "Skopiuj klucz" }));

        expect(writeText).toHaveBeenCalledWith("typ_testkey");
    });
});
