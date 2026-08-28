import type { SerieItem } from "@pulsefx/shared-types";
import { formatarData, formatarValor, formatarVariacao } from "../lib/format.js";

// FR-002: cada observacao exibida tem sua data de referencia visivel individualmente.
export function SerieTabela({ pontos }: { pontos: SerieItem[] }) {
  return (
    <table>
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
            <td>{formatarVariacao(ponto.variacao)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
