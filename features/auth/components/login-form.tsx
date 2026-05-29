"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoginForm: FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setPending(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        setPending(false);

        if (result?.error) {
            setError("Nieprawidłowy adres e-mail lub hasło.");
            return;
        }

        router.push(callbackUrl);
        router.refresh();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Zaloguj się</CardTitle>
                <CardDescription>
                    Wpisz adres e-mail i hasło, aby przejść do panelu.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="flex flex-col gap-4">
                    {error ? (
                        <p className="text-sm text-destructive" role="alert">
                            {error}
                        </p>
                    ) : null}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            disabled={pending}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Hasło</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            disabled={pending}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "Logowanie…" : "Zaloguj się"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Nie masz konta?{" "}
                        <Link
                            href="/register"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Zarejestruj się
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
};
