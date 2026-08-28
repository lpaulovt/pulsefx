import { afterAll, afterEach, describe, expect, it } from "vitest";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresFavoritoRepository } from "../../src/infrastructure/persistence/postgres/favorito-repository.js";

// Requer Postgres de teste rodando (docker-compose up -d postgres + migrate:up), mesmo
// setup de apps/api/tests/persistence/indicador-repository.test.ts.
const USER_ID = "user_test_favorito_repo";
const OUTRO_USER_ID = "user_test_favorito_repo_outro";
const INDICADOR_ID = "usd-brl-ptax";

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM favorito WHERE user_id = ANY($1)", [[USER_ID, OUTRO_USER_ID]]);
}

describe("PostgresFavoritoRepository", () => {
  const repository = new PostgresFavoritoRepository();

  afterEach(limpar);
  afterAll(() => pool.end());

  it("marcar e idempotente - upsert, chamar duas vezes nao duplica nem falha (data-model.md)", async () => {
    await repository.marcar(USER_ID, INDICADOR_ID);
    await repository.marcar(USER_ID, INDICADOR_ID);

    expect(await repository.listarIndicadorIds(USER_ID)).toEqual([INDICADOR_ID]);
  });

  it("desmarcar remove o favorito", async () => {
    await repository.marcar(USER_ID, INDICADOR_ID);

    await repository.desmarcar(USER_ID, INDICADOR_ID);

    expect(await repository.listarIndicadorIds(USER_ID)).toEqual([]);
  });

  it("desmarcar e idempotente - nao falha quando nunca foi marcado", async () => {
    await expect(repository.desmarcar(USER_ID, INDICADOR_ID)).resolves.toBeUndefined();
  });

  it("listarIndicadorIds isola favoritos por usuario (FR-004)", async () => {
    await repository.marcar(USER_ID, INDICADOR_ID);
    await repository.marcar(OUTRO_USER_ID, INDICADOR_ID);

    expect(await repository.listarIndicadorIds(USER_ID)).toEqual([INDICADOR_ID]);
    expect(await repository.listarIndicadorIds(OUTRO_USER_ID)).toEqual([INDICADOR_ID]);
  });
});
