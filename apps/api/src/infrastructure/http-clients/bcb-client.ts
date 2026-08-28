import type {
  FonteExternaClient,
  ObservacaoBruta,
} from "../../domain/sincronizacao/fonte-externa-client.js";

// Codigos de serie do BCB SGS confirmados em docs/product/pdr-selecao-indicadores.md.
const CODIGO_SGS: Record<string, number> = {
  "usd-brl-ptax": 1,
  "meta-selic": 432,
  ipca: 433,
};

interface RegistroSgs {
  data: string; // "DD/MM/AAAA"
  valor: string;
}

function converterDataSgs(data: string): string {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}

/** Cliente do BCB SGS (dados abertos, sem chave) - PTAX, Selic, IPCA. */
export class BcbClient implements FonteExternaClient {
  async buscarUltimoValor(indicadorId: string): Promise<ObservacaoBruta> {
    const codigo = CODIGO_SGS[indicadorId];
    if (codigo === undefined) {
      throw new Error(`BcbClient: indicador desconhecido "${indicadorId}"`);
    }

    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`;
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`BcbClient: BCB respondeu ${resposta.status} para ${indicadorId}`);
    }

    const registros = (await resposta.json()) as RegistroSgs[];
    const ultimo = registros.at(-1);
    if (!ultimo) {
      throw new Error(`BcbClient: sem observacao para ${indicadorId}`);
    }

    return { dataReferencia: converterDataSgs(ultimo.data), valor: Number(ultimo.valor) };
  }
}
