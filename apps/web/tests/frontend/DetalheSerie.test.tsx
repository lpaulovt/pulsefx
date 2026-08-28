import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { SerieResponse } from "@pulsefx/shared-types";

const serieIncompleta: SerieResponse = {
  indicadorId: "ipca",
  tipoSerie: "macro-mensal",
  janelaSolicitada: 12,
  historicoCompleto: false,
  pontos: [{ dataReferencia: "2026-08-01", valor: 0.3, variacao: { tipo: "indisponivel", motivo: "historico_insuficiente" } }],
  textoLimitacoes: "Dado publicado pelo Banco Central do Brasil (SGS).",
};

vi.mock("../../src/services/api-client.js", () => ({
  getSerie: vi.fn().mockResolvedValue(serieIncompleta),
}));

const { DetalheSerie } = await import("../../src/pages/DetalheSerie.js");

describe("DetalheSerie - US1", () => {
  it("renderiza a tabela com o historico e avisa quando ainda esta incompleto (FR-003)", async () => {
    render(<DetalheSerie indicadorId="ipca" />);

    await waitFor(() => expect(screen.getByRole("table")).toBeTruthy());

    expect(screen.getByText("01/08/2026")).toBeTruthy();
    expect(screen.getByText(/ainda sendo formado/i)).toBeTruthy();
  });
});
