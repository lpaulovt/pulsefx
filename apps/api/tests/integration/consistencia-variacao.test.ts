import { afterAll, afterEach, describe, expect, it } from "vitest";
import { ObterDashboard } from "../../src/application/indicador/obter-dashboard.js";
import { ObterSerie } from "../../src/application/indicador/obter-serie.js";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresIndicadorRepository } from "../../src/infrastructure/persistence/postgres/indicador-repository.js";

// Requer Postgres de teste rodando (docker-compose up -d postgres + migrate:up).
// Datas estritamente maiores que qualquer outra fixture de teste para o mesmo indicador
// (apps/api/tests/persistence/indicador-repository.test.ts usa 2099-01-01/02) - garante que
// estas 2 observacoes sempre vencem o "ORDER BY data_referencia DESC LIMIT N" mesmo se os
// testes rodarem em paralelo contra o mesmo Postgres.
const INDICADOR_ID = "usd-brl-ptax";
const DATAS = ["2100-06-01", "2100-06-02"];

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM observacao WHERE indicador_id = $1 AND data_referencia = ANY($2)", [
    INDICADOR_ID,
    DATAS,
  ]);
}

describe("Consistencia de variacao entre Dashboard e Detalhe (US3, FR-006)", () => {
  const repository = new PostgresIndicadorRepository();
  const obterDashboard = new ObterDashboard(repository);
  const obterSerie = new ObterSerie(repository);

  afterEach(limpar);
  afterAll(() => pool.end());

  it("mesmo indicador/dataReferencia: variacao identica (valor, sinal, unidade) em /indicadores e /indicadores/:id/serie", async () => {
    await pool.query(
      `INSERT INTO observacao (indicador_id, data_referencia, valor) VALUES ($1, $2, 5.10), ($1, $3, 5.42)
       ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET valor = EXCLUDED.valor`,
      [INDICADOR_ID, DATAS[0], DATAS[1]],
    );

    const dashboard = await obterDashboard.executar();
    const itemDashboard = dashboard.find((item) => item.indicadorId === INDICADOR_ID);
    expect(itemDashboard?.dataReferencia).toBe(DATAS[1]);

    const serie = await obterSerie.executar(INDICADOR_ID);
    const pontoSerie = serie?.pontos.find((ponto) => ponto.dataReferencia === DATAS[1]);

    expect(pontoSerie?.variacao).toEqual(itemDashboard?.variacao);
  });
});
