/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // .env real vive na raiz do monorepo, nao em apps/web - sem isso o Vite so acha
  // VITE_* var se sourced manualmente no shell antes do `npm run dev`.
  envDir: fileURLToPath(new URL("../..", import.meta.url)),
  test: {
    environment: "jsdom",
  },
});
