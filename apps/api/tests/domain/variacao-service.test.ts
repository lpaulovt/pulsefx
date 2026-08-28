import { describe, expect, it } from "vitest";
import { VariacaoService } from "../../src/domain/indicador/variacao-service.js";
import type { Indicador } from "../../src/domain/indicador/indicador.js";
import type { Observacao } from "../../src/domain/indicador/observacao.js";

const service = new VariacaoService();

const fxDiaria: Indicador = {
  id: "usd-brl-ptax",
  nome: "USD/BRL (PTAX venda)",
  tipoSerie: "fx-diaria",
  fonte: "bcb",
  unidade: "percentual",
};

const macroMensalPercentual: Indicador = {
  id: "ipca",
  nome: "IPCA (variacao mensal)",
  tipoSerie: "macro-mensal",
  fonte: "bcb",
  unidade: "percentual",
};

const selic: Indicador = {
  id: "meta-selic",
  nome: "Meta Selic",
  tipoSerie: "macro-mensal",
  fonte: "bcb",
  unidade: "pontos-percentuais",
};

function obs(dataReferencia: string, valor: number, indicadorId = "x"): Observacao {
  return { indicadorId, dataReferencia, valor };
}

describe("VariacaoService", () => {
  it("fx-diaria: compara ultimo fechamento com D-1 util anterior, em percentual", () => {
    const resultado = service.calcular(fxDiaria, [obs("2026-08-27", 5.32), obs("2026-08-26", 5.30)]);

    expect(resultado).toEqual({ tipo: "calculada", valor: 0.38, unidade: "percentual", sinal: "+" });
  });

  it("macro-mensal (percentual): compara ultimo mes com N=1 mes anterior", () => {
    const resultado = service.calcular(macroMensalPercentual, [
      obs("2026-08-01", 0.3),
      obs("2026-07-01", 0.4),
    ]);

    expect(resultado.tipo).toBe("calculada");
    expect(resultado).toMatchObject({ unidade: "percentual", sinal: "-" });
  });

  it("Selic (pontos-percentuais): usa diferenca simples, nao variacao percentual do valor", () => {
    const resultado = service.calcular(selic, [obs("2026-08-01", 10.75), obs("2026-07-01", 10.75)]);

    expect(resultado).toEqual({ tipo: "calculada", valor: 0, unidade: "pontos-percentuais", sinal: "0" });
  });

  it("Selic com mudanca real: diferenca em p.p., nao percentual", () => {
    const resultado = service.calcular(selic, [obs("2026-08-01", 11.0), obs("2026-07-01", 10.75)]);

    expect(resultado).toEqual({ tipo: "calculada", valor: 0.25, unidade: "pontos-percentuais", sinal: "+" });
  });

  it("retorna indisponivel/historico_insuficiente com apenas 1 observacao", () => {
    const resultado = service.calcular(fxDiaria, [obs("2026-08-27", 5.32)]);

    expect(resultado).toEqual({ tipo: "indisponivel", motivo: "historico_insuficiente" });
  });

  it("retorna indisponivel/sem_observacao sem nenhuma observacao", () => {
    const resultado = service.calcular(fxDiaria, []);

    expect(resultado).toEqual({ tipo: "indisponivel", motivo: "sem_observacao" });
  });
});
