"use client";

import { LogOutIcon } from "lucide-react";
import type { FC } from "react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/features/auth/server/sign-out-action";

export const SignOutMenuItem: FC = () => {
    return (
        <form action={signOutAction} className="contents">
            <DropdownMenuItem
                nativeButton
                render={<button type="submit" className="w-full" />}
                variant="destructive"
            >
                <LogOutIcon />
                Wyloguj się
            </DropdownMenuItem>
        </form>
    );
};
