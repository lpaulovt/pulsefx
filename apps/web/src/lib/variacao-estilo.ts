import type { VariacaoResult } from "@pulsefx/shared-types";

// Classificacao puramente visual (cor/estilo) reaproveitada por IndicadorCard e
// SerieTabela (issue #47) - garante que "indisponivel" nunca herde o mesmo estilo de
// uma variacao zero real (guardrail de design). Nao recalcula nem reinterpreta o dado,
// so mapeia o VariacaoResult ja pronto da API para uma chave de estilo.
export type VariacaoEstilo = "up" | "down" | "neutro" | "indisponivel";

export function classificarVariacao(variacao: VariacaoResult): VariacaoEstilo {
  if (variacao.tipo === "indisponivel") {
    return "indisponivel";
  }
  if (variacao.sinal === "+") return "up";
  if (variacao.sinal === "-") return "down";
  return "neutro";
}
