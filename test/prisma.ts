import type { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

export function resetPrisma(): void {
    mockReset(prisma);
}
