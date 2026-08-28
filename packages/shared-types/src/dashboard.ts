// DTOs do contrato HTTP GET /indicadores (specs/001-dashboard/contracts/get-indicadores.md).
// Reaproveitado por apps/api (mapeia domain -> DTO na interface HTTP) e apps/web (le a resposta).

export type TipoSerie = "fx-diaria" | "macro-mensal";
export type Unidade = "percentual" | "pontos-percentuais";

export type VariacaoResult =
  | { tipo: "calculada"; valor: number; unidade: Unidade; sinal: "+" | "-" | "0" }
  | { tipo: "indisponivel"; motivo: "historico_insuficiente" | "sem_observacao" };

export interface DashboardItem {
  indicadorId: string;
  nome: string;
  tipoSerie: TipoSerie;
  ultimoValor: number | null;
  dataReferencia: string | null;
  variacao: VariacaoResult;
}

export interface DashboardResponse {
  indicadores: DashboardItem[];
}
