import type { Observacao } from "../indicador/observacao.js";

/**
 * Porta (domain) para persistencia de Observacao. Implementada em
 * infrastructure/persistence/postgres - domain nunca importa `pg`.
 */
export interface ObservacaoRepository {
  /** Upsert por (indicadorId, dataReferencia) - reprocessar a mesma janela nao duplica linha. */
  salvar(observacao: Observacao): Promise<void>;
}
