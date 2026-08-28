import { afterAll, afterEach, describe, expect, it } from "vitest";
import { CATALOGO_INDICADORES } from "../../src/domain/indicador/catalogo.js";
import type {
  FonteExternaClient,
  ObservacaoBruta,
} from "../../src/domain/sincronizacao/fonte-externa-client.js";
import { SincronizarIndicador } from "../../src/application/sincronizacao/sincronizar-indicador.js";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresJobExecucaoRepository } from "../../src/infrastructure/persistence/postgres/job-execucao-repository.js";
import { PostgresObservacaoRepository } from "../../src/infrastructure/persistence/postgres/observacao-repository.js";

// Requer Postgres de teste rodando (docker-compose up -d postgres + migrate:up) - ver
// specs/004-sincronizacao/quickstart.md. Client fake -> dominio -> repositorio real (T012).
const INDICADOR = CATALOGO_INDICADORES.find((i) => i.id === "fed-funds")!;
const DATA_REFERENCIA = "1999-12-31"; // data isolada, nunca usada por dado real

class FakeFonteExternaClient implements FonteExternaClient {
  constructor(private readonly resposta: ObservacaoBruta) {}
  async buscarUltimoValor(): Promise<ObservacaoBruta> {
    return this.resposta;
  }
}

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM observacao WHERE indicador_id = $1 AND data_referencia = $2", [
    INDICADOR.id,
    DATA_REFERENCIA,
  ]);
  await pool.query("DELETE FROM job_execucao WHERE indicador_id = $1", [INDICADOR.id]);
}

describe("SincronizarIndicador (integracao)", () => {
  afterEach(limpar);
  afterAll(() => pool.end());

  it("client fake -> dominio -> repositorio: persiste Observacao e registra JobExecucao de sucesso", async () => {
    const fake = new FakeFonteExternaClient({ dataReferencia: DATA_REFERENCIA, valor: 5.25 });
    const useCase = new SincronizarIndicador(
      { bcb: fake, fred: fake },
      new PostgresObservacaoRepository(),
      new PostgresJobExecucaoRepository(),
    );

    await useCase.executar(INDICADOR, "agendado");

    const observacoes = await pool.query(
      "SELECT valor::float AS valor FROM observacao WHERE indicador_id = $1 AND data_referencia = $2",
      [INDICADOR.id, DATA_REFERENCIA],
    );
    expect(observacoes.rows).toEqual([{ valor: 5.25 }]);

    const execucoes = await pool.query(
      "SELECT status, origem FROM job_execucao WHERE indicador_id = $1 ORDER BY id DESC LIMIT 1",
      [INDICADOR.id],
    );
    expect(execucoes.rows).toEqual([{ status: "sucesso", origem: "agendado" }]);
  });
});
