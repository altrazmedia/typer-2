import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/auth/components/login-form";
import { mockRouter } from "@/test/router";

describe("LoginForm", () => {
    it("renders Polish labels", () => {
        render(<LoginForm />);
        expect(
            screen.getByText("Zaloguj się", {
                selector: '[data-slot="card-title"]',
            }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
        expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Zaloguj się" }),
        ).toBeInTheDocument();
    });

    it("calls signIn with credentials and navigates on success", async () => {
        const user = userEvent.setup();
        vi.mocked(signIn).mockResolvedValue({
            error: undefined,
            ok: true,
            status: 200,
            url: null,
        } as never);

        render(<LoginForm />);
        await user.type(screen.getByLabelText("E-mail"), "a@b.c");
        await user.type(screen.getByLabelText("Hasło"), "secret");
        await user.click(screen.getByRole("button", { name: "Zaloguj się" }));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith("credentials", {
                email: "a@b.c",
                password: "secret",
                redirect: false,
                callbackUrl: "/",
            });
        });
        expect(mockRouter.push).toHaveBeenCalledWith("/");
        expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it("shows Polish error when signIn returns error", async () => {
        const user = userEvent.setup();
        vi.mocked(signIn).mockResolvedValue({
            error: "CredentialsSignin",
            ok: false,
            status: 401,
            url: null,
        } as never);

        render(<LoginForm />);
        await user.type(screen.getByLabelText("E-mail"), "a@b.c");
        await user.type(screen.getByLabelText("Hasło"), "wrong");
        await user.click(screen.getByRole("button", { name: "Zaloguj się" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Nieprawidłowy adres e-mail lub hasło.",
        );
        expect(mockRouter.push).not.toHaveBeenCalled();
    });
});
