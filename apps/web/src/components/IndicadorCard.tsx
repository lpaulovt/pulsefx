import type { DashboardItem } from "@pulsefx/shared-types";
import { formatarData, formatarValor, formatarVariacao } from "../lib/format.js";

export function IndicadorCard({ item }: { item: DashboardItem }) {
  return (
    <article data-testid={`indicador-card-${item.indicadorId}`}>
      <header>
        <h2>{item.nome}</h2>
        <span>{item.tipoSerie === "fx-diaria" ? "Diario" : "Mensal"}</span>
      </header>
      {item.ultimoValor !== null && item.dataReferencia !== null ? (
        <>
          <p>{formatarValor(item.ultimoValor)}</p>
          <p>Referencia: {formatarData(item.dataReferencia)}</p>
        </>
      ) : (
        <p>Sem observacao sincronizada ainda</p>
      )}
      <p>{formatarVariacao(item.variacao)}</p>
    </article>
  );
}
