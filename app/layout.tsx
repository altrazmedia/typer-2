import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { ToastProviderViewport } from "@/components/ui/toast";

import { AuthSessionProvider } from "./providers";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Typer",
    description: "Prywatne typowanie wyników meczów",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pl"
            className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">
                <ToastProviderViewport>
                    <AuthSessionProvider>{children}</AuthSessionProvider>
                </ToastProviderViewport>
            </body>
        </html>
    );
}
