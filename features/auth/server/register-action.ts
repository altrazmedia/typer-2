"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

export type RegisterState = {
    error?: string;
};

export async function registerAction(
    _prevState: RegisterState | null,
    formData: FormData,
): Promise<RegisterState> {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!name || !email || !password || !confirmPassword) {
        return { error: "Wszystkie pola są wymagane." };
    }

    if (password !== confirmPassword) {
        return { error: "Hasła nie są zgodne." };
    }

    if (password.length < 8) {
        return { error: "Hasło musi mieć co najmniej 8 znaków." };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "Konto z tym adresem e-mail już istnieje." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
    });

    redirect("/login");
}
