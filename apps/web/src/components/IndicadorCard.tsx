import type { DashboardItem } from "@pulsefx/shared-types";
import { formatarData, formatarValor, formatarVariacao } from "../lib/format.js";
import { classificarVariacao } from "../lib/variacao-estilo.js";
import { BotaoFavoritar } from "./BotaoFavoritar.js";
import styles from "./IndicadorCard.module.css";

export interface IndicadorCardProps {
  item: DashboardItem;
  /** true em telas que ja filtram por favorito (MeusIndicadores, US2) - estrela inicia marcada. */
  favoritado?: boolean;
}

const CLASSE_CARD: Record<string, string | undefined> = {
  up: styles.cardUp,
  down: styles.cardDown,
  neutro: "",
  indisponivel: styles.cardIndisponivel,
};

const CLASSE_VARIACAO: Record<string, string | undefined> = {
  up: styles.variacaoUp,
  down: styles.variacaoDown,
  neutro: styles.variacaoNeutro,
  indisponivel: styles.variacaoIndisponivel,
};

export function IndicadorCard({ item, favoritado = false }: IndicadorCardProps) {
  const estilo = classificarVariacao(item.variacao);

  return (
    <article
      data-testid={`indicador-card-${item.indicadorId}`}
      className={`${styles.card} ${CLASSE_CARD[estilo] ?? ""}`}
    >
      <header className={styles.header}>
        <div className={styles.titulo}>
          <h2 className={styles.nome}>{item.nome}</h2>
          <span className={styles.tipo}>{item.tipoSerie === "fx-diaria" ? "Diario" : "Mensal"}</span>
        </div>
        <BotaoFavoritar indicadorId={item.indicadorId} favoritadoInicial={favoritado} />
      </header>
      {item.ultimoValor !== null && item.dataReferencia !== null ? (
        <>
          <p className={styles.valor}>{formatarValor(item.ultimoValor)}</p>
          <p className={styles.referencia}>Referencia: {formatarData(item.dataReferencia)}</p>
        </>
      ) : (
        <p className={styles.semDado}>Sem observacao sincronizada ainda</p>
      )}
      <p className={CLASSE_VARIACAO[estilo]}>{formatarVariacao(item.variacao)}</p>
    </article>
  );
}
