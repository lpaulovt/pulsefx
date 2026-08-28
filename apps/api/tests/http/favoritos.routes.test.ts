import { beforeEach, describe, expect, it, vi } from "vitest";

// getAuth mockado (sem conta Clerk real neste ambiente) - retorna userId conforme o
// cenario, nunca instancia o SDK real nem chama rede. clerkPlugin tambem mockado como
// no-op: buildServer registra o plugin real de qualquer forma, mas aqui ele nunca roda.
const getAuthMock = vi.fn();
vi.mock("@clerk/fastify", () => ({
  clerkPlugin: (_instance: unknown, _opts: unknown, done: () => void) => done(),
  getAuth: (request: unknown) => getAuthMock(request),
}));

const { buildServer } = await import("../../src/interface/http/server.js");
const { MarcarFavorito } = await import("../../src/application/favorito/marcar-favorito.js");
const { DesmarcarFavorito } = await import("../../src/application/favorito/desmarcar-favorito.js");
const { ListarFavoritos } = await import("../../src/application/favorito/listar-favoritos.js");
const { ObterDashboard } = await import("../../src/application/indicador/obter-dashboard.js");
type FavoritoRepository = import("../../src/domain/favorito/favorito-repository.js").FavoritoRepository;
type IndicadorRepository = import("../../src/domain/indicador/indicador-repository.js").IndicadorRepository;

function buildFakeFavoritoRepository(): FavoritoRepository {
  return {
    marcar: vi.fn().mockResolvedValue(undefined),
    desmarcar: vi.fn().mockResolvedValue(undefined),
    listarIndicadorIds: vi.fn().mockResolvedValue([]),
  };
}

function buildFakeDeps(favoritoRepository: FavoritoRepository) {
  const indicadorRepository: IndicadorRepository = {
    listarComUltimasObservacoes: vi.fn().mockResolvedValue([]),
    buscarSerie: vi.fn(),
  };
  const obterDashboard = new ObterDashboard(indicadorRepository);
  return {
    obterDashboard,
    obterSerie: { executar: vi.fn() } as unknown as import("../../src/application/indicador/obter-serie.js").ObterSerie,
    sincronizarIndicador: { executar: vi.fn() } as unknown as import("../../src/application/sincronizacao/sincronizar-indicador.js").SincronizarIndicador,
    marcarFavorito: new MarcarFavorito(favoritoRepository),
    desmarcarFavorito: new DesmarcarFavorito(favoritoRepository),
    listarFavoritos: new ListarFavoritos(obterDashboard, favoritoRepository),
  };
}

describe("POST/DELETE /favoritos/:indicadorId (contracts/favoritos.md)", () => {
  beforeEach(() => {
    getAuthMock.mockReset();
  });

  it("POST retorna 401 sem sessao", async () => {
    getAuthMock.mockReturnValue({ userId: null });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "POST", url: "/favoritos/usd-brl-ptax" });

    expect(resposta.statusCode).toBe(401);
    expect(favoritoRepository.marcar).not.toHaveBeenCalled();
  });

  it("POST retorna 204 e marca o favorito com sessao valida", async () => {
    getAuthMock.mockReturnValue({ userId: "user_fake_123" });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "POST", url: "/favoritos/usd-brl-ptax" });

    expect(resposta.statusCode).toBe(204);
    expect(favoritoRepository.marcar).toHaveBeenCalledWith("user_fake_123", "usd-brl-ptax");
  });

  it("POST retorna 404 para indicador fora do conjunto fechado do MVP", async () => {
    getAuthMock.mockReturnValue({ userId: "user_fake_123" });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "POST", url: "/favoritos/nao-existe" });

    expect(resposta.statusCode).toBe(404);
    expect(favoritoRepository.marcar).not.toHaveBeenCalled();
  });

  it("DELETE retorna 401 sem sessao", async () => {
    getAuthMock.mockReturnValue({ userId: null });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "DELETE", url: "/favoritos/usd-brl-ptax" });

    expect(resposta.statusCode).toBe(401);
    expect(favoritoRepository.desmarcar).not.toHaveBeenCalled();
  });

  it("DELETE retorna 204 com sessao valida - idempotente mesmo sem favorito previo", async () => {
    getAuthMock.mockReturnValue({ userId: "user_fake_123" });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "DELETE", url: "/favoritos/usd-brl-ptax" });

    expect(resposta.statusCode).toBe(204);
    expect(favoritoRepository.desmarcar).toHaveBeenCalledWith("user_fake_123", "usd-brl-ptax");
  });
});

describe("GET /favoritos (contracts/favoritos.md)", () => {
  beforeEach(() => {
    getAuthMock.mockReset();
  });

  it("retorna 401 sem sessao", async () => {
    getAuthMock.mockReturnValue({ userId: null });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "GET", url: "/favoritos" });

    expect(resposta.statusCode).toBe(401);
  });

  it("retorna 200 com os indicadores favoritados do usuario, no shape de DashboardItem", async () => {
    getAuthMock.mockReturnValue({ userId: "user_fake_123" });
    const favoritoRepository = buildFakeFavoritoRepository();
    favoritoRepository.listarIndicadorIds = vi.fn().mockResolvedValue(["usd-brl-ptax"]);
    const deps = buildFakeDeps(favoritoRepository);
    // Dashboard completo tem 2 indicadores no conjunto fechado do MVP, so 1 e favoritado -
    // GET /favoritos deve filtrar, nunca retornar o dashboard inteiro.
    const indicadorRepository: IndicadorRepository = {
      listarComUltimasObservacoes: vi.fn().mockResolvedValue([
        {
          indicador: { id: "usd-brl-ptax", nome: "USD/BRL", tipoSerie: "fx-diaria", fonte: "bcb", unidade: "percentual" },
          ultimasObservacoes: [],
        },
        {
          indicador: { id: "ipca", nome: "IPCA", tipoSerie: "macro-mensal", fonte: "bcb", unidade: "percentual" },
          ultimasObservacoes: [],
        },
      ]),
      buscarSerie: vi.fn(),
    };
    deps.listarFavoritos = new ListarFavoritos(new ObterDashboard(indicadorRepository), favoritoRepository);
    const app = await buildServer(deps);

    const resposta = await app.inject({ method: "GET", url: "/favoritos" });

    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { indicadores: Array<{ indicadorId: string }> };
    expect(corpo.indicadores.map((item) => item.indicadorId)).toEqual(["usd-brl-ptax"]);
  });

  it("retorna 200 com indicadores: [] quando nenhum favorito foi marcado", async () => {
    getAuthMock.mockReturnValue({ userId: "user_fake_123" });
    const favoritoRepository = buildFakeFavoritoRepository();
    const app = await buildServer(buildFakeDeps(favoritoRepository));

    const resposta = await app.inject({ method: "GET", url: "/favoritos" });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toEqual({ indicadores: [] });
  });
});
