import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="font-heading text-base font-semibold"
                        >
                            Typer
                        </Link>
                        <nav className="flex items-center gap-4 text-sm">
                            <Link
                                href="/dashboard"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Panel
                            </Link>
                            <Link
                                href="/tournaments"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Turnieje
                            </Link>
                        </nav>
                    </div>
                    <SignOutButton />
                </div>
            </header>
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
                {children}
            </main>
        </div>
    );
}
