import type {
  FonteExternaClient,
  ObservacaoBruta,
} from "../../domain/sincronizacao/fonte-externa-client.js";

// Serie confirmada em docs/product/pdr-selecao-indicadores.md.
const SERIES_ID: Record<string, string> = {
  "fed-funds": "FEDFUNDS",
};

interface RegistroFred {
  date: string; // "AAAA-MM-DD"
  value: string; // "." quando o valor esta ausente
}

interface RespostaFred {
  observations: RegistroFred[];
}

/** Cliente do FRED (`fred/series/observations`) - exige api_key. */
export class FredClient implements FonteExternaClient {
  constructor(private readonly apiKey: string) {}

  async buscarUltimoValor(indicadorId: string): Promise<ObservacaoBruta> {
    const seriesId = SERIES_ID[indicadorId];
    if (seriesId === undefined) {
      throw new Error(`FredClient: indicador desconhecido "${indicadorId}"`);
    }

    const url =
      `https://api.stlouisfed.org/fred/series/observations` +
      `?series_id=${seriesId}&api_key=${this.apiKey}&file_type=json&sort_order=desc&limit=1`;
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`FredClient: FRED respondeu ${resposta.status} para ${indicadorId}`);
    }

    const body = (await resposta.json()) as RespostaFred;
    const ultimo = body.observations[0];
    if (!ultimo || ultimo.value === ".") {
      throw new Error(`FredClient: sem observacao valida para ${indicadorId}`);
    }

    return { dataReferencia: ultimo.date, valor: Number(ultimo.value) };
  }
}
