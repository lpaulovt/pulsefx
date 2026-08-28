import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SerieItem } from "@pulsefx/shared-types";
import { SerieTabela } from "../../src/components/SerieTabela.js";

describe("SerieTabela", () => {
  it("FR-002: exibe a data de referencia de cada observacao individualmente", () => {
    const pontos: SerieItem[] = [
      { dataReferencia: "2026-08-26", valor: 5.3, variacao: { tipo: "indisponivel", motivo: "historico_insuficiente" } },
      { dataReferencia: "2026-08-27", valor: 5.32, variacao: { tipo: "calculada", valor: 0.38, unidade: "percentual", sinal: "+" } },
    ];

    render(<SerieTabela pontos={pontos} />);

    expect(screen.getByText("26/08/2026")).toBeTruthy();
    expect(screen.getByText("27/08/2026")).toBeTruthy();
    expect(screen.getByText("+0,38 %")).toBeTruthy();
    expect(screen.getByText("Sem variacao calculavel ainda")).toBeTruthy();
  });

  it("sem pontos: renderiza tabela vazia, sem erro", () => {
    const { container } = render(<SerieTabela pontos={[]} />);

    expect(container.querySelector("table")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
  });
});
