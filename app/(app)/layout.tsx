import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
          <Link href="/dashboard" className="font-heading text-base font-semibold">
            Typer
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
