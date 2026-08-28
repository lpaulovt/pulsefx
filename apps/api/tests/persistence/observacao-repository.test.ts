import { afterAll, afterEach, describe, expect, it } from "vitest";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresObservacaoRepository } from "../../src/infrastructure/persistence/postgres/observacao-repository.js";

// Requer Postgres de teste rodando (docker-compose up -d postgres + migrate:up) e
// DATABASE_URL apontando para ele - ver specs/004-sincronizacao/quickstart.md.
const INDICADOR_ID = "usd-brl-ptax";
const DATA_REFERENCIA = "2000-01-01"; // data isolada, nunca usada por dado real

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM observacao WHERE indicador_id = $1 AND data_referencia = $2", [
    INDICADOR_ID,
    DATA_REFERENCIA,
  ]);
}

describe("PostgresObservacaoRepository", () => {
  const repository = new PostgresObservacaoRepository();

  afterEach(limpar);
  afterAll(() => pool.end());

  it("upsert por (indicador_id, data_referencia) nao duplica linha ao reprocessar", async () => {
    await repository.salvar({ indicadorId: INDICADOR_ID, dataReferencia: DATA_REFERENCIA, valor: 5.1 });
    await repository.salvar({ indicadorId: INDICADOR_ID, dataReferencia: DATA_REFERENCIA, valor: 5.42 });

    const { rows } = await pool.query(
      "SELECT valor::float AS valor FROM observacao WHERE indicador_id = $1 AND data_referencia = $2",
      [INDICADOR_ID, DATA_REFERENCIA],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].valor).toBe(5.42);
  });
});
