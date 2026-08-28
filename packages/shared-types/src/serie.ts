// DTOs do contrato HTTP GET /indicadores/:id/serie (specs/002-detalhe-serie/contracts/get-serie.md).
import type { TipoSerie, VariacaoResult } from "./dashboard.js";

export interface SerieItem {
  dataReferencia: string;
  valor: number;
  variacao: VariacaoResult;
}

export interface SerieResponse {
  indicadorId: string;
  tipoSerie: TipoSerie;
  /** Janela padrao por tipo de serie: 30 (fx-diaria) ou 12 (macro-mensal). */
  janelaSolicitada: number;
  /** `false` quando `pontos.length < janelaSolicitada` - historico ainda em formacao (FR-003). */
  historicoCompleto: boolean;
  /** Ordenado cronologicamente (mais antigo primeiro). */
  pontos: SerieItem[];
  textoLimitacoes: string;
}
