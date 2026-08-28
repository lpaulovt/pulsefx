import { describe, expect, it } from "vitest";
import { obterTextoLimitacoes } from "../../src/domain/indicador/limitacoes.js";

describe("obterTextoLimitacoes (FR-004/US2)", () => {
  it("cobre os 4 pontos minimos: fonte, defasagem, revisao, sem interpolacao", () => {
    const texto = obterTextoLimitacoes({ tipoSerie: "fx-diaria", fonte: "bcb" });

    expect(texto).toMatch(/Banco Central do Brasil/);
    expect(texto).toMatch(/defasado/);
    expect(texto).toMatch(/revisar/);
    expect(texto).toMatch(/interpolacao/);
  });

  it("varia o nome da fonte por indicador (FRED != BCB)", () => {
    const texto = obterTextoLimitacoes({ tipoSerie: "macro-mensal", fonte: "fred" });

    expect(texto).toMatch(/Federal Reserve/);
  });
});
