"use client";

import {
    CheckIcon,
    CopyIcon,
    KeyRoundIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast } from "@/lib/toast";

export const ApiKeySection: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    async function handleGenerate() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/me/api-key/regenerate", {
                method: "POST",
            });
            if (!res.ok) {
                showErrorToast("Nie udało się wygenerować klucza API.");
                return;
            }
            const data = (await res.json()) as { apiKey: string };
            setApiKey(data.apiKey);
            setCopied(false);
        } catch {
            showErrorToast("Nie udało się wygenerować klucza API.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCopy() {
        if (!apiKey) return;
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <KeyRoundIcon className="size-5" />
                <h2 className="font-heading text-lg font-semibold">
                    Klucz API
                </h2>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                    Klucz API umożliwia uwierzytelnienie żądań do API. Przekaż
                    go w nagłówku{" "}
                    <code className="font-mono text-foreground">X-API-Key</code>
                    .
                </p>
            </div>

            <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? "Generowanie..." : "Generuj nowy klucz"}
            </Button>

            {apiKey !== null && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400">
                        <TriangleAlertIcon className="size-4 shrink-0" />
                        <p>
                            Poprzednie klucze zostały unieważnione. Ten klucz
                            nie zostanie pokazany ponownie - skopiuj go teraz.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            readOnly
                            value={apiKey}
                            className="font-mono"
                            aria-label="Wygenerowany klucz API"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                            aria-label="Skopiuj klucz"
                        >
                            {copied ? (
                                <CheckIcon className="size-4" />
                            ) : (
                                <CopyIcon className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
};
