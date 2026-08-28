import type { DashboardItem } from "@pulsefx/shared-types";
import { formatarData, formatarValor, formatarVariacao } from "../lib/format.js";
import { BotaoFavoritar } from "./BotaoFavoritar.js";

export interface IndicadorCardProps {
  item: DashboardItem;
  /** true em telas que ja filtram por favorito (MeusIndicadores, US2) - estrela inicia marcada. */
  favoritado?: boolean;
}

export function IndicadorCard({ item, favoritado = false }: IndicadorCardProps) {
  return (
    <article data-testid={`indicador-card-${item.indicadorId}`}>
      <header>
        <h2>{item.nome}</h2>
        <span>{item.tipoSerie === "fx-diaria" ? "Diario" : "Mensal"}</span>
        <BotaoFavoritar indicadorId={item.indicadorId} favoritadoInicial={favoritado} />
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
