import { buildServer } from "./interface/http/server.js";
import { env } from "./infrastructure/config/env.js";
import { SincronizarIndicador } from "./application/sincronizacao/sincronizar-indicador.js";
import { BcbClient } from "./infrastructure/http-clients/bcb-client.js";
import { FredClient } from "./infrastructure/http-clients/fred-client.js";
import { PostgresJobExecucaoRepository } from "./infrastructure/persistence/postgres/job-execucao-repository.js";
import { PostgresObservacaoRepository } from "./infrastructure/persistence/postgres/observacao-repository.js";
import { registrarSyncJobs } from "./infrastructure/scheduler/sync-scheduler.js";

async function main(): Promise<void> {
  const app = await buildServer();

  const sincronizarIndicador = new SincronizarIndicador(
    { bcb: new BcbClient(), fred: new FredClient(env.fredApiKey) },
    new PostgresObservacaoRepository(),
    new PostgresJobExecucaoRepository(),
  );
  registrarSyncJobs(sincronizarIndicador);

  await app.listen({ port: env.port, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
