import { criarObservacao, type Observacao } from "../indicador/observacao.js";
import type { ObservacaoBruta } from "./fonte-externa-client.js";

/** Traduz o payload bruto de uma fonte externa (BCB/FRED) para o modelo de dominio Observacao. */
export function normalizarObservacao(indicadorId: string, bruta: ObservacaoBruta): Observacao {
  return criarObservacao({
    indicadorId,
    dataReferencia: bruta.dataReferencia,
    valor: bruta.valor,
  });
}
