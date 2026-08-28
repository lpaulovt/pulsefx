import { describe, expect, it, vi } from "vitest";
import { buildServer } from "../../src/interface/http/server.js";
import { ObterDashboard } from "../../src/application/indicador/obter-dashboard.js";
import type { IndicadorRepository } from "../../src/domain/indicador/indicador-repository.js";

function buildFakeDeps(repository: IndicadorRepository) {
  return {
    obterDashboard: new ObterDashboard(repository),
    // rota admin nao e exercitada aqui, mas buildServer exige o dep no tipo ServerDeps.
    sincronizarIndicador: { executar: vi.fn() } as unknown as import("../../src/application/sincronizacao/sincronizar-indicador.js").SincronizarIndicador,
  };
}

describe("GET /indicadores", () => {
  it("retorna os 4 indicadores, mesmo sem observacao (FR-001, FR-010)", async () => {
    const repository: IndicadorRepository = {
      listarComUltimasObservacoes: vi.fn().mockResolvedValue([
        {
          indicador: {
            id: "usd-brl-ptax",
            nome: "USD/BRL (PTAX venda)",
            tipoSerie: "fx-diaria",
            fonte: "bcb",
            unidade: "percentual",
          },
          ultimasObservacoes: [
            { indicadorId: "usd-brl-ptax", dataReferencia: "2026-08-27", valor: 5.32 },
            { indicadorId: "usd-brl-ptax", dataReferencia: "2026-08-26", valor: 5.3 },
          ],
        },
        {
          indicador: {
            id: "ipca",
            nome: "IPCA (variacao mensal)",
            tipoSerie: "macro-mensal",
            fonte: "bcb",
            unidade: "percentual",
          },
          ultimasObservacoes: [],
        },
      ]),
    };
    const app = await buildServer(buildFakeDeps(repository));

    const resposta = await app.inject({ method: "GET", url: "/indicadores" });

    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json();
    expect(corpo.indicadores).toHaveLength(2);
    expect(corpo.indicadores[0]).toEqual({
      indicadorId: "usd-brl-ptax",
      nome: "USD/BRL (PTAX venda)",
      tipoSerie: "fx-diaria",
      ultimoValor: 5.32,
      dataReferencia: "2026-08-27",
      variacao: { tipo: "calculada", valor: 0.38, unidade: "percentual", sinal: "+" },
    });
  });

  it("indicador sem observacao nunca fabrica variacao (FR-007)", async () => {
    const repository: IndicadorRepository = {
      listarComUltimasObservacoes: vi.fn().mockResolvedValue([
        {
          indicador: {
            id: "ipca",
            nome: "IPCA (variacao mensal)",
            tipoSerie: "macro-mensal",
            fonte: "bcb",
            unidade: "percentual",
          },
          ultimasObservacoes: [],
        },
      ]),
    };
    const app = await buildServer(buildFakeDeps(repository));

    const resposta = await app.inject({ method: "GET", url: "/indicadores" });

    expect(resposta.json().indicadores[0]).toEqual({
      indicadorId: "ipca",
      nome: "IPCA (variacao mensal)",
      tipoSerie: "macro-mensal",
      ultimoValor: null,
      dataReferencia: null,
      variacao: { tipo: "indisponivel", motivo: "sem_observacao" },
    });
  });

  it("nunca chama fonte externa (FR-009) - so depende do repositorio", async () => {
    const listarComUltimasObservacoes = vi.fn().mockResolvedValue([]);
    const app = await buildServer(buildFakeDeps({ listarComUltimasObservacoes }));

    await app.inject({ method: "GET", url: "/indicadores" });

    expect(listarComUltimasObservacoes).toHaveBeenCalledTimes(1);
  });
});
