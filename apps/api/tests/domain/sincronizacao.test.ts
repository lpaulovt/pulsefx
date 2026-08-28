import { describe, expect, it } from "vitest";
import { normalizarObservacao } from "../../src/domain/sincronizacao/normalizar-observacao.js";

describe("normalizarObservacao", () => {
  it("traduz payload bruto (BCB/FRED) para Observacao de dominio", () => {
    const observacao = normalizarObservacao("usd-brl-ptax", {
      dataReferencia: "2026-08-27",
      valor: 5.31,
    });

    expect(observacao).toEqual({
      indicadorId: "usd-brl-ptax",
      dataReferencia: "2026-08-27",
      valor: 5.31,
    });
  });

  it("rejeita valor NaN (payload malformado da fonte)", () => {
    expect(() =>
      normalizarObservacao("fed-funds", { dataReferencia: "2026-08-01", valor: Number("nao-e-numero") }),
    ).toThrow(/valor invalido/);
  });

  it("rejeita dataReferencia futura", () => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    expect(() => normalizarObservacao("ipca", { dataReferencia: amanha, valor: 0.5 })).toThrow(
      /dataReferencia futura/,
    );
  });
});
