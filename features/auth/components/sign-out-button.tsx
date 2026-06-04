import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export const SignOutButton: FC = () => {
    return (
        <form
            action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
            }}
        >
            <Button
                type="submit"
                variant="outline"
                size="sm"
                className="bg-sidebar-primary text-sidebar-primary-foreground"
            >
                Wyloguj się
            </Button>
        </form>
    );
};
