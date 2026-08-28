import type { Indicador } from "./indicador.js";
import type { Observacao } from "./observacao.js";

// Uniao discriminada em vez de `number | null` (research.md) - forca quem consome a tratar
// "sem variacao calculavel" explicitamente, nunca fabricar 0%.
export type VariacaoResult =
  | { tipo: "calculada"; valor: number; unidade: Indicador["unidade"]; sinal: "+" | "-" | "0" }
  | { tipo: "indisponivel"; motivo: "historico_insuficiente" | "sem_observacao" };

/**
 * Calcula a variacao de um indicador a partir das observacoes mais recentes (a mais
 * recente primeiro, no maximo 2). Regra e a mesma para fx-diaria (N=1 dia util anterior)
 * e macro-mensal (N=1 mes anterior) - a janela ja foi resolvida por quem monta a lista
 * (repositorio so guarda observacao por data efetivamente publicada, nunca calendario
 * "furado"). Selic (unidade pontos-percentuais) usa diferenca simples, nao percentual
 * do valor percentual (readme.md secao 5 / research.md).
 */
export class VariacaoService {
  calcular(indicador: Indicador, ultimasObservacoes: readonly Observacao[]): VariacaoResult {
    if (ultimasObservacoes.length === 0) {
      return { tipo: "indisponivel", motivo: "sem_observacao" };
    }
    if (ultimasObservacoes.length < 2) {
      return { tipo: "indisponivel", motivo: "historico_insuficiente" };
    }

    const [atual, anterior] = ultimasObservacoes;
    if (!atual || !anterior) {
      // Inalcancavel dado o length check acima - so satisfaz noUncheckedIndexedAccess.
      return { tipo: "indisponivel", motivo: "historico_insuficiente" };
    }
    const diferenca =
      indicador.unidade === "pontos-percentuais"
        ? atual.valor - anterior.valor
        : ((atual.valor - anterior.valor) / anterior.valor) * 100;

    return {
      tipo: "calculada",
      valor: arredondar(diferenca),
      unidade: indicador.unidade,
      sinal: diferenca > 0 ? "+" : diferenca < 0 ? "-" : "0",
    };
  }
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
