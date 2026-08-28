import { afterAll, afterEach, describe, expect, it } from "vitest";
import { ListarFavoritos } from "../../src/application/favorito/listar-favoritos.js";
import { ObterDashboard } from "../../src/application/indicador/obter-dashboard.js";
import { pool } from "../../src/infrastructure/persistence/postgres/client.js";
import { PostgresFavoritoRepository } from "../../src/infrastructure/persistence/postgres/favorito-repository.js";
import { PostgresIndicadorRepository } from "../../src/infrastructure/persistence/postgres/indicador-repository.js";

// Requer Postgres de teste rodando (docker-compose up -d postgres + migrate:up), mesmo
// setup de apps/api/tests/persistence/favorito-repository.test.ts.
const USER_ID = "user_test_favoritos_persistencia";
const INDICADOR_ID = "usd-brl-ptax";

async function limpar(): Promise<void> {
  await pool.query("DELETE FROM favorito WHERE user_id = $1", [USER_ID]);
}

// FR-003 (spec.md): favorito sobrevive a reload/nova sessao no mesmo dispositivo - a
// fonte de verdade e o Postgres, nunca estado em memoria do processo. Simula "nova
// sessao" instanciando um novo grafo de objetos (novo ListarFavoritos/repositorios) em
// vez de reaproveitar a instancia que marcou o favorito.
describe("Persistencia de favoritos entre sessoes (US2, FR-003)", () => {
  afterEach(limpar);
  afterAll(() => pool.end());

  it("favorito marcado permanece visivel em uma nova instancia de ListarFavoritos (novo login)", async () => {
    const favoritoRepository = new PostgresFavoritoRepository();
    await favoritoRepository.marcar(USER_ID, INDICADOR_ID);

    // "nova sessao": novo ListarFavoritos, nova ObterDashboard, novo repositorio - nada
    // compartilhado em memoria com a marcacao acima, so o Postgres.
    const novaSessaoListarFavoritos = new ListarFavoritos(
      new ObterDashboard(new PostgresIndicadorRepository()),
      new PostgresFavoritoRepository(),
    );

    const favoritos = await novaSessaoListarFavoritos.executar(USER_ID);

    expect(favoritos.map((item) => item.indicadorId)).toContain(INDICADOR_ID);
  });

  it("sem favorito marcado, nova sessao retorna lista vazia (nao erro)", async () => {
    const novaSessaoListarFavoritos = new ListarFavoritos(
      new ObterDashboard(new PostgresIndicadorRepository()),
      new PostgresFavoritoRepository(),
    );

    const favoritos = await novaSessaoListarFavoritos.executar(USER_ID);

    expect(favoritos).toEqual([]);
  });
});
