import { describe, expect, it, vi } from "vitest";
import { buildServer } from "../../src/interface/http/server.js";
import { ObterSerie } from "../../src/application/indicador/obter-serie.js";
import { ObterDashboard } from "../../src/application/indicador/obter-dashboard.js";
import type { IndicadorRepository } from "../../src/domain/indicador/indicador-repository.js";

function buildFakeDeps(repository: IndicadorRepository) {
  return {
    obterDashboard: new ObterDashboard(repository),
    obterSerie: new ObterSerie(repository),
    sincronizarIndicador: { executar: vi.fn() } as unknown as import("../../src/application/sincronizacao/sincronizar-indicador.js").SincronizarIndicador,
  };
}

describe("GET /indicadores/:id/serie", () => {
  it("200: retorna a janela com pontos ordenados cronologicamente e textoLimitacoes (contracts/get-serie.md)", async () => {
    const repository: IndicadorRepository = {
      listarComUltimasObservacoes: vi.fn(),
      buscarSerie: vi.fn().mockResolvedValue({
        indicador: { id: "usd-brl-ptax", nome: "USD/BRL (PTAX venda)", tipoSerie: "fx-diaria", fonte: "bcb", unidade: "percentual" },
        observacoes: [
          { indicadorId: "usd-brl-ptax", dataReferencia: "2026-08-26", valor: 5.3 },
          { indicadorId: "usd-brl-ptax", dataReferencia: "2026-08-27", valor: 5.32 },
        ],
      }),
    };
    const app = await buildServer(buildFakeDeps(repository));

    const resposta = await app.inject({ method: "GET", url: "/indicadores/usd-brl-ptax/serie" });

    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json();
    expect(corpo.indicadorId).toBe("usd-brl-ptax");
    expect(corpo.tipoSerie).toBe("fx-diaria");
    expect(corpo.janelaSolicitada).toBe(30);
    expect(corpo.historicoCompleto).toBe(false);
    expect(corpo.pontos).toHaveLength(2);
    expect(corpo.pontos.map((p: { dataReferencia: string }) => p.dataReferencia)).toEqual([
      "2026-08-26",
      "2026-08-27",
    ]);
    expect(typeof corpo.textoLimitacoes).toBe("string");
    expect(corpo.textoLimitacoes.length).toBeGreaterThan(0);
  });

  it("404: indicador fora do conjunto fechado do MVP", async () => {
    const repository: IndicadorRepository = {
      listarComUltimasObservacoes: vi.fn(),
      buscarSerie: vi.fn(),
    };
    const app = await buildServer(buildFakeDeps(repository));

    const resposta = await app.inject({ method: "GET", url: "/indicadores/nao-existe/serie" });

    expect(resposta.statusCode).toBe(404);
    expect(resposta.json()).toEqual({ error: "indicador_nao_encontrado" });
  });
});
