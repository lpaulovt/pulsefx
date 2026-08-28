import type { Fonte, Indicador, TipoSerie } from "./indicador.js";

// Texto de limitacoes (FR-004/US2, spec.md desta feature): conteudo estatico versionado
// com o codigo, chaveado por fonte/tipoSerie (research.md) - nao persistido no banco.

const NOME_FONTE: Record<Fonte, string> = {
  bcb: "Banco Central do Brasil (SGS)",
  fred: "Federal Reserve Bank of St. Louis (FRED)",
};

const FREQUENCIA_SYNC: Record<TipoSerie, string> = {
  "fx-diaria": "diariamente",
  "macro-mensal": "mensalmente",
};

/**
 * Cobre os 4 pontos minimos da vision (secao 5.2): fonte oficial, defasagem de
 * sincronizacao, possibilidade de revisao historica pela fonte, ausencia de interpolacao.
 */
export function obterTextoLimitacoes(indicador: Pick<Indicador, "tipoSerie" | "fonte">): string {
  const fonte = NOME_FONTE[indicador.fonte];
  const frequencia = FREQUENCIA_SYNC[indicador.tipoSerie];
  return (
    `Dado publicado pelo ${fonte}. O Pulse FX sincroniza esta serie ${frequencia}, portanto o ` +
    `valor exibido e o ultimo conhecido pelo Pulse FX e pode estar defasado em relacao a fonte ` +
    `original. A fonte pode revisar valores historicos ja publicados. Nenhuma lacuna de ` +
    `calendario e preenchida por interpolacao - o que nao existe na fonte, nao aparece aqui.`
  );
}
