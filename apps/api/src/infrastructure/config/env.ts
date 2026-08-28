// Unico ponto de leitura de process.env - resto do codigo importa daqui, nunca de
// process.env direto. TODO(spec): validar com zod (fail-fast se DATABASE_URL/FRED_API_KEY
// ausentes) assim que a lista final de variaveis estiver fechada.

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  fredApiKey: process.env.FRED_API_KEY ?? "",
  syncTtlMinutes: Number(process.env.SYNC_TTL_MINUTES ?? 60),
};
