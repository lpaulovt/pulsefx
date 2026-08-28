import type { Indicador } from "./indicador.js";
import type { Observacao } from "./observacao.js";

export interface IndicadorComObservacoes {
  indicador: Indicador;
  /** As 2 mais recentes, da mais recente para a mais antiga; vazio se nunca sincronizado. */
  ultimasObservacoes: Observacao[];
}

export interface SerieIndicador {
  indicador: Indicador;
  /** Ate `limit` observacoes, da mais antiga para a mais recente (ordem de exibicao). */
  observacoes: Observacao[];
}

/**
 * Porta (domain) de leitura para o Dashboard/Detalhe. Implementada em
 * infrastructure/persistence/postgres - domain nunca importa `pg`.
 */
export interface IndicadorRepository {
  /** Sempre retorna o conjunto fechado do MVP, mesmo indicador sem nenhuma observacao (FR-010). */
  listarComUltimasObservacoes(): Promise<IndicadorComObservacoes[]>;
  /**
   * Janela de historico para o Detalhe (FR-001): as `limit` observacoes persistidas mais
   * recentes do indicador, sem interpolar lacuna de calendario. `null` quando o indicador
   * nao existe no conjunto fechado do MVP (404 na rota).
   */
  buscarSerie(indicadorId: string, limit: number): Promise<SerieIndicador | null>;
}
