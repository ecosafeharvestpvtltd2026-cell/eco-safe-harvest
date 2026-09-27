import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend component/integration suite.
 *
 * The `@` alias mirrors `vite.config.js` so tests import application modules
 * exactly as the app does. `jsdom` is the DOM environment the pages need.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    // The sandbox reports a single CPU; pin the worker bounds so Tinypool does
    // not derive a conflicting min/max pair from the host's CPU count.
    pool: "forks",
    minWorkers: 1,
    maxWorkers: 1,
  },
});
