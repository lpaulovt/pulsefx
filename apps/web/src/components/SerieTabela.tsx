import type { SerieItem } from "@pulsefx/shared-types";
import { formatarData, formatarValor, formatarVariacao } from "../lib/format.js";
import { classificarVariacao } from "../lib/variacao-estilo.js";
import styles from "./SerieTabela.module.css";

// FR-002: cada observacao exibida tem sua data de referencia visivel individualmente.
export function SerieTabela({ pontos }: { pontos: SerieItem[] }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th scope="col">Data de referencia</th>
            <th scope="col">Valor</th>
            <th scope="col">Variacao</th>
          </tr>
        </thead>
        <tbody>
          {pontos.map((ponto) => (
            <tr key={ponto.dataReferencia}>
              <td>{formatarData(ponto.dataReferencia)}</td>
              <td>{formatarValor(ponto.valor)}</td>
              <td className={styles[classificarVariacao(ponto.variacao)]}>
                {formatarVariacao(ponto.variacao)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
