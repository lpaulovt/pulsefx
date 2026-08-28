import { afterAll, afterEach, describe, expect, it } from "vitest";
import { CATALOGO_INDICADORES } from "../../src/domain/indicador/catalogo.js";
import type { FonteExternaClient } from "../../src/domain/sincronizacao/fonte-externa-client.js";
import { SincronizarIndicador } from "../../src/application/sincronizacao/sincronizar-indicador.js";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresJobExecucaoRepository } from "../../src/infrastructure/persistence/postgres/job-execucao-repository.js";
import { PostgresObservacaoRepository } from "../../src/infrastructure/persistence/postgres/observacao-repository.js";

// US3 (T020): fonte externa indisponivel (mesmo apos o retry) nao derruba o produto -
// ultimo dado valido persistido permanece, e a falha fica registrada em JobExecucao.
// Indicador diferente do usado em tests/integration/sincronizacao.test.ts (fed-funds) -
// vitest roda arquivos de teste em paralelo contra o mesmo Postgres, e "ultima linha de
// job_execucao para este indicador_id" ficaria em corrida entre os dois arquivos se
// compartilhassem o mesmo indicador_id.
const INDICADOR = CATALOGO_INDICADORES.find((i) => i.id === "ipca")!;
const DATA_REFERENCIA = "1999-12-31"; // data isolada, nunca usada por dado real
const VALOR_VALIDO_ANTERIOR = 5.25;

class ClientSempreIndisponivel implements FonteExternaClient {
  chamadas = 0;
  async buscarUltimoValor(): Promise<never> {
    this.chamadas += 1;
    throw new Error("fonte externa indisponivel");
  }
}

const observacaoRepository = new PostgresObservacaoRepository();
const jobExecucaoRepository = new PostgresJobExecucaoRepository();

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM observacao WHERE indicador_id = $1 AND data_referencia = $2", [
    INDICADOR.id,
    DATA_REFERENCIA,
  ]);
  await pool.query("DELETE FROM job_execucao WHERE indicador_id = $1", [INDICADOR.id]);
}

describe("SincronizarIndicador - resiliencia a falha externa (US3)", () => {
  afterEach(limpar);
  afterAll(() => pool.end());

  it("mantem o ultimo dado valido e registra falha_fonte_externa quando a fonte falha mesmo apos o retry", async () => {
    // Simula que ja existia uma observacao valida persistida por uma sincronizacao anterior.
    await observacaoRepository.salvar({
      indicadorId: INDICADOR.id,
      dataReferencia: DATA_REFERENCIA,
      valor: VALOR_VALIDO_ANTERIOR,
    });

    const clienteFalho = new ClientSempreIndisponivel();
    const semEspera = async () => {}; // retry sem esperar o backoff real nos testes
    const useCase = new SincronizarIndicador(
      { bcb: clienteFalho, fred: clienteFalho },
      observacaoRepository,
      jobExecucaoRepository,
      semEspera,
    );

    await expect(useCase.executar(INDICADOR, "agendado")).resolves.toBeUndefined();

    // 1 tentativa + 1 retry (research.md) - nunca mais que isso.
    expect(clienteFalho.chamadas).toBe(2);

    const observacoes = await pool.query(
      "SELECT valor::float AS valor FROM observacao WHERE indicador_id = $1 AND data_referencia = $2",
      [INDICADOR.id, DATA_REFERENCIA],
    );
    expect(observacoes.rows).toEqual([{ valor: VALOR_VALIDO_ANTERIOR }]);

    const execucoes = await pool.query(
      "SELECT status, detalhe FROM job_execucao WHERE indicador_id = $1 ORDER BY id DESC LIMIT 1",
      [INDICADOR.id],
    );
    expect(execucoes.rows[0].status).toBe("falha_fonte_externa");
    expect(execucoes.rows[0].detalhe).toMatch(/indisponivel/);
  });
});
