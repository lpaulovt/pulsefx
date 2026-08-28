import { describe, expect, it, vi } from "vitest";

// ADMIN_SYNC_KEY precisa estar setado antes de `env.ts` ser importado (import estatico
// e resolvido antes do corpo do arquivo) - por isso os modulos abaixo sao carregados
// dinamicamente, depois de setar a env var.
process.env.ADMIN_SYNC_KEY = "test-key";

const { buildServer } = await import("../../src/interface/http/server.js");
const { SincronizarIndicador } = await import("../../src/application/sincronizacao/sincronizar-indicador.js");

function buildFakeSincronizarIndicador() {
  return new SincronizarIndicador(
    { bcb: { buscarUltimoValor: vi.fn() }, fred: { buscarUltimoValor: vi.fn() } },
    { salvar: vi.fn() },
    { registrar: vi.fn() },
  );
}

describe("POST /admin/sync", () => {
  it("retorna 401 sem X-Admin-Key (FR-004)", async () => {
    const app = await buildServer({ sincronizarIndicador: buildFakeSincronizarIndicador() });

    const resposta = await app.inject({ method: "POST", url: "/admin/sync", payload: {} });

    expect(resposta.statusCode).toBe(401);
    expect(resposta.json()).toEqual({ error: "unauthorized" });
  });

  it("retorna 401 com X-Admin-Key incorreta", async () => {
    const app = await buildServer({ sincronizarIndicador: buildFakeSincronizarIndicador() });

    const resposta = await app.inject({
      method: "POST",
      url: "/admin/sync",
      headers: { "x-admin-key": "chave-errada" },
      payload: {},
    });

    expect(resposta.statusCode).toBe(401);
  });

  it("retorna 202 e dispara sincronizacao com X-Admin-Key correta (FR-003)", async () => {
    const sincronizarIndicador = buildFakeSincronizarIndicador();
    const executarSpy = vi.spyOn(sincronizarIndicador, "executar").mockResolvedValue(undefined);
    const app = await buildServer({ sincronizarIndicador });

    const resposta = await app.inject({
      method: "POST",
      url: "/admin/sync",
      headers: { "x-admin-key": "test-key" },
      payload: {},
    });

    expect(resposta.statusCode).toBe(202);
    expect(resposta.json().status).toBe("accepted");
    expect(executarSpy).toHaveBeenCalled();
  });

  it("retorna 400 para indicadorId desconhecido", async () => {
    const app = await buildServer({ sincronizarIndicador: buildFakeSincronizarIndicador() });

    const resposta = await app.inject({
      method: "POST",
      url: "/admin/sync",
      headers: { "x-admin-key": "test-key" },
      payload: { indicadorId: "nao-existe" },
    });

    expect(resposta.statusCode).toBe(400);
    expect(resposta.json()).toEqual({ error: "unknown_indicador" });
  });
});
