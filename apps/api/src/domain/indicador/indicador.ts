// Tipos de dominio puros - sem Fastify/pg/node-cron (ver apps/api/src/domain).
// Compartilhado entre specs/004-sincronizacao (escreve) e specs/001-dashboard (le).

export type TipoSerie = "fx-diaria" | "macro-mensal";
export type Fonte = "bcb" | "fred";
export type Unidade = "percentual" | "pontos-percentuais";

// Conjunto fechado do MVP, semeado via migration (docs/product/pdr-selecao-indicadores.md).
export interface Indicador {
  id: string;
  nome: string;
  tipoSerie: TipoSerie;
  fonte: Fonte;
  unidade: Unidade;
}
