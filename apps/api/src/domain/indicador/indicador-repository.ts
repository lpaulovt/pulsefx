import type { Indicador } from "./indicador.js";
import type { Observacao } from "./observacao.js";

export interface IndicadorComObservacoes {
  indicador: Indicador;
  /** As 2 mais recentes, da mais recente para a mais antiga; vazio se nunca sincronizado. */
  ultimasObservacoes: Observacao[];
}

/**
 * Porta (domain) de leitura para o Dashboard/Detalhe. Implementada em
 * infrastructure/persistence/postgres - domain nunca importa `pg`.
 */
export interface IndicadorRepository {
  /** Sempre retorna o conjunto fechado do MVP, mesmo indicador sem nenhuma observacao (FR-010). */
  listarComUltimasObservacoes(): Promise<IndicadorComObservacoes[]>;
}
