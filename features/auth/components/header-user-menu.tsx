"use client";

import { MenuIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutMenuItem } from "@/features/auth/components/sign-out-button";
import { useTheme } from "@/lib/use-theme";

export const HeaderUserMenu: FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon" aria-label="Menu" />
                }
            >
                <MenuIcon />
                <span className="sr-only">Menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => toggleTheme()}
                    aria-label={
                        isDark
                            ? "Przełącz na jasny motyw"
                            : "Przełącz na ciemny motyw"
                    }
                >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                    {isDark ? "Jasny motyw" : "Ciemny motyw"}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/settings" />}>
                    <SettingsIcon />
                    Ustawienia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutMenuItem />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
