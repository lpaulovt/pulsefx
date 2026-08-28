import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { DashboardItem } from "@pulsefx/shared-types";
import { IndicadorCard } from "../../src/components/IndicadorCard.js";

function itemBase(overrides: Partial<DashboardItem>): DashboardItem {
  return {
    indicadorId: "meta-selic",
    nome: "Meta Selic",
    tipoSerie: "macro-mensal",
    ultimoValor: 10.75,
    dataReferencia: "2026-08-01",
    variacao: { tipo: "calculada", valor: 0, unidade: "pontos-percentuais", sinal: "0" },
    ...overrides,
  };
}

describe("IndicadorCard", () => {
  it("US2: nunca mostra '0%' quando falta historico - mostra estado explicito (1 observacao)", () => {
    render(
      <IndicadorCard
        item={itemBase({ variacao: { tipo: "indisponivel", motivo: "historico_insuficiente" } })}
      />,
    );

    expect(screen.queryByText(/0%/)).toBeNull();
    expect(screen.getByText("Sem variacao calculavel ainda")).toBeTruthy();
  });

  it("US2: sem nenhuma observacao - estado explicito, sem data/valor fabricado", () => {
    render(
      <IndicadorCard
        item={itemBase({
          ultimoValor: null,
          dataReferencia: null,
          variacao: { tipo: "indisponivel", motivo: "sem_observacao" },
        })}
      />,
    );

    expect(screen.queryByText(/0%/)).toBeNull();
    expect(screen.getByText("Sem dado sincronizado ainda")).toBeTruthy();
  });

  it("edge case do spec: Selic sem mudanca no mes mostra '0,00 p.p.' (dado real, nao indisponivel)", () => {
    render(<IndicadorCard item={itemBase({})} />);

    expect(screen.getByText("0,00 p.p.")).toBeTruthy();
    expect(screen.queryByText(/0%/)).toBeNull();
  });
});
