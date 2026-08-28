import type { VariacaoResult } from "@pulsefx/shared-types";

// Formatacao compartilhada entre IndicadorCard (Dashboard) e SerieTabela (Detalhe) -
// mesma regra de exibicao nas duas telas (FR-006 de specs/002-detalhe-serie/spec.md).
const FORMATADOR_VALOR = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatarValor(valor: number): string {
  return FORMATADOR_VALOR.format(valor);
}

export function formatarData(dataReferencia: string): string {
  const [ano, mes, dia] = dataReferencia.split("-");
  return `${dia}/${mes}/${ano}`;
}

// FR-007 (Dashboard) / US2 (Detalhe): nunca fabricar "0%" - estado indisponivel e
// explicito, tratado a parte do valor calculado.
export function formatarVariacao(variacao: VariacaoResult): string {
  if (variacao.tipo === "indisponivel") {
    return variacao.motivo === "sem_observacao"
      ? "Sem dado sincronizado ainda"
      : "Sem variacao calculavel ainda";
  }
  const unidade = variacao.unidade === "pontos-percentuais" ? "p.p." : "%";
  const sinal = variacao.sinal === "0" ? "" : variacao.sinal;
  return `${sinal}${formatarValor(Math.abs(variacao.valor))} ${unidade}`;
}
