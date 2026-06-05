import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    // Avoid loading postcss.config.mjs (@tailwindcss/postcss native binary SIGBUS on WSL).
    css: { postcss: { plugins: [] } },
    resolve: {
        tsconfigPaths: true,
        alias: {
            "server-only": path.resolve(rootDir, "test/stubs/server-only.ts"),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./test/setup.ts"],
        globals: true,
        include: [
            "features/**/__tests__/**/*.test.{ts,tsx}",
            "lib/**/__tests__/**/*.test.ts",
        ],
    },
});
