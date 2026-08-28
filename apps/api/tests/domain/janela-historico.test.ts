import { describe, expect, it, vi } from "vitest";
import { ObterSerie } from "../../src/application/indicador/obter-serie.js";
import type { IndicadorRepository } from "../../src/domain/indicador/indicador-repository.js";

function fakeRepository(buscarSerie: IndicadorRepository["buscarSerie"]): IndicadorRepository {
  return { listarComUltimasObservacoes: vi.fn(), buscarSerie };
}

describe("ObterSerie - janela por tipo de serie (FR-001)", () => {
  it("fx-diaria: solicita janela de 30 ao repositorio", async () => {
    const buscarSerie = vi.fn().mockResolvedValue({
      indicador: { id: "usd-brl-ptax", nome: "USD/BRL", tipoSerie: "fx-diaria", fonte: "bcb", unidade: "percentual" },
      observacoes: [],
    });
    const caso = new ObterSerie(fakeRepository(buscarSerie));

    const resultado = await caso.executar("usd-brl-ptax");

    expect(buscarSerie).toHaveBeenCalledWith("usd-brl-ptax", 30);
    expect(resultado?.janelaSolicitada).toBe(30);
  });

  it("macro-mensal: solicita janela de 12 ao repositorio", async () => {
    const buscarSerie = vi.fn().mockResolvedValue({
      indicador: { id: "ipca", nome: "IPCA", tipoSerie: "macro-mensal", fonte: "bcb", unidade: "percentual" },
      observacoes: [],
    });
    const caso = new ObterSerie(fakeRepository(buscarSerie));

    const resultado = await caso.executar("ipca");

    expect(buscarSerie).toHaveBeenCalledWith("ipca", 12);
    expect(resultado?.janelaSolicitada).toBe(12);
  });

  it("indicador fora do conjunto fechado do MVP: retorna null sem consultar repositorio", async () => {
    const buscarSerie = vi.fn();
    const caso = new ObterSerie(fakeRepository(buscarSerie));

    const resultado = await caso.executar("nao-existe");

    expect(resultado).toBeNull();
    expect(buscarSerie).not.toHaveBeenCalled();
  });

  it("historico incompleto (menos observacoes que a janela) marca historicoCompleto false", async () => {
    const buscarSerie = vi.fn().mockResolvedValue({
      indicador: { id: "ipca", nome: "IPCA", tipoSerie: "macro-mensal", fonte: "bcb", unidade: "percentual" },
      observacoes: [{ indicadorId: "ipca", dataReferencia: "2026-08-01", valor: 0.3 }],
    });
    const caso = new ObterSerie(fakeRepository(buscarSerie));

    const resultado = await caso.executar("ipca");

    expect(resultado?.historicoCompleto).toBe(false);
    expect(resultado?.pontos).toHaveLength(1);
    // Primeiro ponto da janela nunca fabrica variacao - so 1 observacao disponivel ate aqui.
    expect(resultado?.pontos[0]?.variacao).toEqual({ tipo: "indisponivel", motivo: "historico_insuficiente" });
  });

  it("nunca interpola: cada ponto reflete so as observacoes persistidas, na ordem cronologica", async () => {
    const buscarSerie = vi.fn().mockResolvedValue({
      indicador: { id: "usd-brl-ptax", nome: "USD/BRL", tipoSerie: "fx-diaria", fonte: "bcb", unidade: "percentual" },
      observacoes: [
        { indicadorId: "usd-brl-ptax", dataReferencia: "2026-08-26", valor: 5.3 },
        { indicadorId: "usd-brl-ptax", dataReferencia: "2026-08-27", valor: 5.32 },
      ],
    });
    const caso = new ObterSerie(fakeRepository(buscarSerie));

    const resultado = await caso.executar("usd-brl-ptax");

    expect(resultado?.pontos.map((p) => p.dataReferencia)).toEqual(["2026-08-26", "2026-08-27"]);
    expect(resultado?.pontos[1]?.variacao).toEqual({
      tipo: "calculada",
      valor: 0.38,
      unidade: "percentual",
      sinal: "+",
    });
  });
});
