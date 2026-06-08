import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InstallPwaButton } from "@/features/pwa/components/install-pwa-button";
import type { BeforeInstallPromptEvent } from "@/features/pwa/types";

function createBeforeInstallPromptEvent(): BeforeInstallPromptEvent {
    const prompt = vi.fn().mockResolvedValue(undefined);

    return Object.assign(
        new Event("beforeinstallprompt", { cancelable: true }),
        {
            prompt,
            userChoice: Promise.resolve({
                outcome: "accepted" as const,
                platform: "web",
            }),
            platforms: ["web"],
        },
    ) as BeforeInstallPromptEvent;
}

describe("InstallPwaButton", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders nothing when install prompt is unavailable", () => {
        const { container } = render(<InstallPwaButton />);

        expect(container).toBeEmptyDOMElement();
    });

    it("shows iOS installation instructions on iPhone", () => {
        vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        );

        render(<InstallPwaButton />);

        expect(screen.getByText("Zainstaluj aplikację")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Stuknij Udostępnij, a następnie Dodaj do ekranu głównego.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Zainstaluj aplikację" }),
        ).not.toBeInTheDocument();
    });

    it("shows install button after beforeinstallprompt event", async () => {
        render(<InstallPwaButton />);

        const event = createBeforeInstallPromptEvent();
        window.dispatchEvent(event);

        expect(
            await screen.findByRole("button", { name: "Zainstaluj aplikację" }),
        ).toBeInTheDocument();
    });

    it("triggers deferred prompt on button click", async () => {
        const user = userEvent.setup();
        const prompt = vi.fn().mockResolvedValue(undefined);

        render(<InstallPwaButton />);

        const event = Object.assign(
            new Event("beforeinstallprompt", { cancelable: true }),
            {
                prompt,
                userChoice: Promise.resolve({
                    outcome: "accepted" as const,
                    platform: "web",
                }),
                platforms: ["web"],
            },
        ) as BeforeInstallPromptEvent;

        window.dispatchEvent(event);

        await user.click(
            await screen.findByRole("button", { name: "Zainstaluj aplikację" }),
        );

        expect(prompt).toHaveBeenCalledOnce();
    });
});
