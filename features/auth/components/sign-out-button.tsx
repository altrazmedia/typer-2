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
            <Button type="submit" variant="outline" size="sm">
                Wyloguj się
            </Button>
        </form>
    );
};
