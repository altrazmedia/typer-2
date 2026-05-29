"use client";

import Link from "next/link";
import { useActionState, type FC } from "react";

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

import {
    registerAction,
    type RegisterState,
} from "@/features/auth/server/register-action";

const initialState: RegisterState | null = null;

export const RegisterForm: FC = () => {
    const [state, formAction, pending] = useActionState(
        registerAction,
        initialState,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Utwórz konto</CardTitle>
                <CardDescription>
                    Podaj swoje dane, aby dołączyć do Typera.
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="flex flex-col gap-4">
                    {state?.error ? (
                        <p className="text-sm text-destructive" role="alert">
                            {state.error}
                        </p>
                    ) : null}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Nazwa użytkownika</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            disabled={pending}
                        />
                    </div>
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
                            autoComplete="new-password"
                            required
                            minLength={8}
                            disabled={pending}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            disabled={pending}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "Tworzenie konta…" : "Zarejestruj się"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Masz już konto?{" "}
                        <Link
                            href="/login"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Zaloguj się
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
};
