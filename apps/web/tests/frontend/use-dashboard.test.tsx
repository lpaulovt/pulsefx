import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { DashboardResponse } from "@pulsefx/shared-types";

const mockResponse: DashboardResponse = {
  indicadores: [
    {
      indicadorId: "usd-brl-ptax",
      nome: "USD/BRL (PTAX venda)",
      tipoSerie: "fx-diaria",
      ultimoValor: 5.32,
      dataReferencia: "2026-08-27",
      variacao: { tipo: "calculada", valor: 0.38, unidade: "percentual", sinal: "+" },
    },
    {
      indicadorId: "meta-selic",
      nome: "Meta Selic",
      tipoSerie: "macro-mensal",
      ultimoValor: 10.75,
      dataReferencia: "2026-08-01",
      variacao: { tipo: "calculada", valor: 0, unidade: "pontos-percentuais", sinal: "0" },
    },
    {
      indicadorId: "ipca",
      nome: "IPCA (variacao mensal)",
      tipoSerie: "macro-mensal",
      ultimoValor: null,
      dataReferencia: null,
      variacao: { tipo: "indisponivel", motivo: "sem_observacao" },
    },
    {
      indicadorId: "fed-funds",
      nome: "Federal Funds Effective Rate",
      tipoSerie: "macro-mensal",
      ultimoValor: 5.33,
      dataReferencia: "2026-08-01",
      variacao: { tipo: "indisponivel", motivo: "historico_insuficiente" },
    },
  ],
};

vi.mock("../../src/services/api-client.js", () => ({
  getDashboard: vi.fn().mockResolvedValue(mockResponse),
}));

const { useDashboard } = await import("../../src/hooks/use-dashboard.js");

describe("useDashboard", () => {
  it("carrega os 4 indicadores retornados pela API (US1)", async () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.indicadores).toHaveLength(4);
    expect(result.current.indicadores.map((item) => item.indicadorId)).toEqual([
      "usd-brl-ptax",
      "meta-selic",
      "ipca",
      "fed-funds",
    ]);
    expect(result.current.erro).toBeNull();
  });

  it("expõe erro quando a API propria falha, sem travar em carregando", async () => {
    const { getDashboard } = await import("../../src/services/api-client.js");
    vi.mocked(getDashboard).mockRejectedValueOnce(new Error("Falha ao carregar indicadores (HTTP 500)"));

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBe("Falha ao carregar indicadores (HTTP 500)");
  });
});
