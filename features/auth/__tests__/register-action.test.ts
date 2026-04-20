import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { registerAction } from "@/features/auth/server/register-action";
import { makeUser } from "@/test/factories";
import { prisma } from "@/test/prisma";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

const validFields = {
  name: "Jan Kowalski",
  email: "jan@example.com",
  password: "secret123",
  confirmPassword: "secret123",
};

describe("registerAction", () => {
  it("returns error when any field is missing", async () => {
    const result = await registerAction(
      null,
      makeFormData({ name: "", email: "", password: "", confirmPassword: "" }),
    );
    expect(result).toEqual({ error: "Wszystkie pola są wymagane." });
  });

  it("returns error when name is missing", async () => {
    const result = await registerAction(
      null,
      makeFormData({ ...validFields, name: "" }),
    );
    expect(result).toEqual({ error: "Wszystkie pola są wymagane." });
  });

  it("returns error when email is missing", async () => {
    const result = await registerAction(
      null,
      makeFormData({ ...validFields, email: "" }),
    );
    expect(result).toEqual({ error: "Wszystkie pola są wymagane." });
  });

  it("returns error when passwords do not match", async () => {
    const result = await registerAction(
      null,
      makeFormData({ ...validFields, confirmPassword: "different" }),
    );
    expect(result).toEqual({ error: "Hasła nie są zgodne." });
  });

  it("returns error when password is shorter than 8 characters", async () => {
    const result = await registerAction(
      null,
      makeFormData({ ...validFields, password: "short", confirmPassword: "short" }),
    );
    expect(result).toEqual({ error: "Hasło musi mieć co najmniej 8 znaków." });
  });

  it("returns error when email already exists", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser({ email: validFields.email }));

    const result = await registerAction(null, makeFormData(validFields));

    expect(result).toEqual({
      error: "Konto z tym adresem e-mail już istnieje.",
    });
  });

  it("creates user with hashed password and redirects on success", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(makeUser());

    await registerAction(null, makeFormData(validFields));

    expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "Jan Kowalski",
        email: "jan@example.com",
        passwordHash: "hashed_password",
      },
    });
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("normalises email to lowercase before lookup and storage", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(makeUser());

    await registerAction(
      null,
      makeFormData({ ...validFields, email: "JAN@EXAMPLE.COM" }),
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "jan@example.com" },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "jan@example.com" }),
      }),
    );
  });

  it("trims whitespace from name before storage", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(makeUser());

    await registerAction(
      null,
      makeFormData({ ...validFields, name: "  Jan Kowalski  " }),
    );

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Jan Kowalski" }),
      }),
    );
  });
});
