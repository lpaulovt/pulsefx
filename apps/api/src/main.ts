import { buildServer } from "./interface/http/server.js";
import { env } from "./infrastructure/config/env.js";
import { SincronizarIndicador } from "./application/sincronizacao/sincronizar-indicador.js";
import { ObterDashboard } from "./application/indicador/obter-dashboard.js";
import { ObterSerie } from "./application/indicador/obter-serie.js";
import { BcbClient } from "./infrastructure/http-clients/bcb-client.js";
import { FredClient } from "./infrastructure/http-clients/fred-client.js";
import { PostgresIndicadorRepository } from "./infrastructure/persistence/postgres/indicador-repository.js";
import { PostgresJobExecucaoRepository } from "./infrastructure/persistence/postgres/job-execucao-repository.js";
import { PostgresObservacaoRepository } from "./infrastructure/persistence/postgres/observacao-repository.js";
import { registrarSyncJobs } from "./infrastructure/scheduler/sync-scheduler.js";

async function main(): Promise<void> {
  const sincronizarIndicador = new SincronizarIndicador(
    { bcb: new BcbClient(), fred: new FredClient(env.fredApiKey) },
    new PostgresObservacaoRepository(),
    new PostgresJobExecucaoRepository(),
  );
  const indicadorRepository = new PostgresIndicadorRepository();
  const obterDashboard = new ObterDashboard(indicadorRepository);
  const obterSerie = new ObterSerie(indicadorRepository);

  const app = await buildServer({ sincronizarIndicador, obterDashboard, obterSerie });
  registrarSyncJobs(sincronizarIndicador);

  await app.listen({ port: env.port, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
