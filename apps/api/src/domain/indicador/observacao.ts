// Medicao pontual de um Indicador numa data de referencia (specs/004-sincronizacao/data-model.md).
// Unicidade (indicadorId, dataReferencia) e responsabilidade do repositorio (upsert), nao deste tipo.

export interface Observacao {
  indicadorId: string;
  /** ISO yyyy-mm-dd - data da observacao na fonte, nunca a data de ingestao. */
  dataReferencia: string;
  valor: number;
}

/**
 * Constroi uma Observacao validando as regras de dominio (data-model.md):
 * valor nao pode ser nulo/NaN, dataReferencia nao pode ser futura.
 */
export function criarObservacao(input: Observacao): Observacao {
  if (Number.isNaN(input.valor)) {
    throw new Error(`valor invalido para observacao de ${input.indicadorId}`);
  }
  if (new Date(input.dataReferencia).getTime() > Date.now()) {
    throw new Error(`dataReferencia futura para observacao de ${input.indicadorId}`);
  }
  return input;
}
