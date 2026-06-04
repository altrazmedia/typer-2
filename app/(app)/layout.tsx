import Link from "next/link";

import { HeaderUserMenu } from "@/features/auth/components/header-user-menu";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <header className="border-b border-border">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/tournaments"
                            className="font-heading text-base font-semibold"
                        >
                            Typer
                        </Link>
                    </div>
                    <HeaderUserMenu />
                </div>
            </header>
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
                {children}
            </main>
        </div>
    );
}
