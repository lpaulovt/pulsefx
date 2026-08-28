import type { DashboardItem } from "@pulsefx/shared-types";

const FORMATADOR_VALOR = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatarData(dataReferencia: string): string {
  const [ano, mes, dia] = dataReferencia.split("-");
  return `${dia}/${mes}/${ano}`;
}

// FR-007/US2: nunca fabricar "0%" - estado indisponivel e explicito, tratado a parte
// do valor calculado.
function formatarVariacao(item: DashboardItem): string {
  const { variacao } = item;
  if (variacao.tipo === "indisponivel") {
    return variacao.motivo === "sem_observacao"
      ? "Sem dado sincronizado ainda"
      : "Sem variacao calculavel ainda";
  }
  const unidade = variacao.unidade === "pontos-percentuais" ? "p.p." : "%";
  const sinal = variacao.sinal === "0" ? "" : variacao.sinal;
  return `${sinal}${FORMATADOR_VALOR.format(Math.abs(variacao.valor))} ${unidade}`;
}

export function IndicadorCard({ item }: { item: DashboardItem }) {
  return (
    <article data-testid={`indicador-card-${item.indicadorId}`}>
      <header>
        <h2>{item.nome}</h2>
        <span>{item.tipoSerie === "fx-diaria" ? "Diario" : "Mensal"}</span>
      </header>
      {item.ultimoValor !== null && item.dataReferencia !== null ? (
        <>
          <p>{FORMATADOR_VALOR.format(item.ultimoValor)}</p>
          <p>Referencia: {formatarData(item.dataReferencia)}</p>
        </>
      ) : (
        <p>Sem observacao sincronizada ainda</p>
      )}
      <p>{formatarVariacao(item)}</p>
    </article>
  );
}
