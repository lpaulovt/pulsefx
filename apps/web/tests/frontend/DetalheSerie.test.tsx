import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { SerieResponse } from "@pulsefx/shared-types";

// Sem setupFiles global de cleanup neste workspace - 2 describe blocks neste arquivo
// renderizam DetalheSerie, entao cada teste precisa desmontar o anterior.
afterEach(cleanup);

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

describe("DetalheSerie - US2", () => {
  it("mostra texto de limitacoes e disclaimer sem exigir acao extra do usuario", async () => {
    render(<DetalheSerie indicadorId="ipca" />);

    // Disclaimer e' estatico, visivel desde a renderizacao inicial (nao espera a serie carregar).
    expect(screen.getByText(/não é recomendação de investimento/i)).toBeTruthy();

    await waitFor(() => expect(screen.getByText(serieIncompleta.textoLimitacoes)).toBeTruthy());
  });
});
