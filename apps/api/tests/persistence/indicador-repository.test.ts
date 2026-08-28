import { afterAll, afterEach, describe, expect, it } from "vitest";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresIndicadorRepository } from "../../src/infrastructure/persistence/postgres/indicador-repository.js";

// Requer Postgres de teste rodando (docker-compose up -d postgres + migrate:up), mesmo
// setup de apps/api/tests/persistence/observacao-repository.test.ts.
const INDICADOR_ID = "usd-brl-ptax";
// Datas no futuro (nao "2000-01-01" como em observacao-repository.test.ts) para garantir
// que ficam no topo do "ORDER BY data_referencia DESC LIMIT 2", mesmo com dado real ja
// sincronizado por outro teste/job na mesma base.
const DATAS = ["2099-01-01", "2099-01-02"];

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM observacao WHERE indicador_id = $1 AND data_referencia = ANY($2)", [
    INDICADOR_ID,
    DATAS,
  ]);
}

describe("PostgresIndicadorRepository", () => {
  const repository = new PostgresIndicadorRepository();

  afterEach(limpar);
  afterAll(() => pool.end());

  it("retorna o conjunto fechado do MVP mesmo sem observacao (FR-010)", async () => {
    const resultado = await repository.listarComUltimasObservacoes();

    expect(resultado.map((item) => item.indicador.id).sort()).toEqual([
      "fed-funds",
      "ipca",
      "meta-selic",
      "usd-brl-ptax",
    ]);
  });

  it("traz no maximo as 2 observacoes mais recentes, da mais recente para a mais antiga", async () => {
    await pool.query(
      `INSERT INTO observacao (indicador_id, data_referencia, valor) VALUES ($1, $2, 5.10), ($1, $3, 5.42)
       ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET valor = EXCLUDED.valor`,
      [INDICADOR_ID, DATAS[0], DATAS[1]],
    );

    const resultado = await repository.listarComUltimasObservacoes();
    const item = resultado.find((entrada) => entrada.indicador.id === INDICADOR_ID);

    expect(item?.ultimasObservacoes).toEqual([
      { indicadorId: INDICADOR_ID, dataReferencia: DATAS[1], valor: 5.42 },
      { indicadorId: INDICADOR_ID, dataReferencia: DATAS[0], valor: 5.1 },
    ]);
  });
});
