import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { SerieResponse } from "@pulsefx/shared-types";

const mockResponse: SerieResponse = {
  indicadorId: "usd-brl-ptax",
  tipoSerie: "fx-diaria",
  janelaSolicitada: 30,
  historicoCompleto: false,
  pontos: [
    { dataReferencia: "2026-08-26", valor: 5.3, variacao: { tipo: "indisponivel", motivo: "historico_insuficiente" } },
    { dataReferencia: "2026-08-27", valor: 5.32, variacao: { tipo: "calculada", valor: 0.38, unidade: "percentual", sinal: "+" } },
  ],
  textoLimitacoes: "Dado publicado pelo Banco Central do Brasil (SGS).",
};

vi.mock("../../src/services/api-client.js", () => ({
  getSerie: vi.fn().mockResolvedValue(mockResponse),
}));

const { useSerie } = await import("../../src/hooks/use-serie.js");

describe("useSerie", () => {
  it("carrega a serie do indicador informado (US1)", async () => {
    const { result } = renderHook(() => useSerie("usd-brl-ptax"));

    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.serie?.pontos).toHaveLength(2);
    expect(result.current.serie?.historicoCompleto).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("expõe erro quando a API propria falha, sem travar em carregando", async () => {
    const { getSerie } = await import("../../src/services/api-client.js");
    vi.mocked(getSerie).mockRejectedValueOnce(new Error("Indicador nao encontrado"));

    const { result } = renderHook(() => useSerie("nao-existe"));

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBe("Indicador nao encontrado");
    expect(result.current.serie).toBeNull();
  });
});
