// Unico ponto de leitura de process.env - resto do codigo importa daqui, nunca de
// process.env direto. TODO(spec): validar com zod (fail-fast se DATABASE_URL/FRED_API_KEY
// ausentes) assim que a lista final de variaveis estiver fechada.

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Carrega o .env da raiz do monorepo (sem dependencia nova) - permite `npm run dev` na raiz
// sem exigir `source .env` manual. So preenche o que ainda nao estiver setado no ambiente
// (env real do processo sempre tem prioridade sobre o arquivo).
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const envPath = resolve(root, ".env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  fredApiKey: process.env.FRED_API_KEY ?? "",
  syncTtlMinutes: Number(process.env.SYNC_TTL_MINUTES ?? 60),
  adminSyncKey: process.env.ADMIN_SYNC_KEY ?? "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? "",
};
