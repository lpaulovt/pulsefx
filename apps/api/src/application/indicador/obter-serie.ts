import type { SerieResponse } from "@pulsefx/shared-types";
import { CATALOGO_INDICADORES } from "../../domain/indicador/catalogo.js";
import type { Indicador } from "../../domain/indicador/indicador.js";
import type { IndicadorRepository } from "../../domain/indicador/indicador-repository.js";
import { obterTextoLimitacoes } from "../../domain/indicador/limitacoes.js";
import type { Observacao } from "../../domain/indicador/observacao.js";
import { VariacaoService } from "../../domain/indicador/variacao-service.js";

// Janela padrao por tipo de serie (spec.md FR-001 / research.md): observacoes
// persistidas, nunca calendario fixo.
const JANELA_POR_TIPO_SERIE: Record<Indicador["tipoSerie"], number> = {
  "fx-diaria": 30,
  "macro-mensal": 12,
};

/**
 * Caso de uso "obter serie" (US1 de specs/002-detalhe-serie): reaproveita o mesmo
 * VariacaoService do Dashboard (FR-005/FR-006) - variacao de cada ponto compara so com o
 * ponto imediatamente anterior dentro da janela, nunca interpola lacuna (FR-001).
 */
export class ObterSerie {
  constructor(
    private readonly indicadorRepository: IndicadorRepository,
    private readonly variacaoService: VariacaoService = new VariacaoService(),
  ) {}

  async executar(indicadorId: string): Promise<SerieResponse | null> {
    const doCatalogo = CATALOGO_INDICADORES.find((indicador) => indicador.id === indicadorId);
    if (!doCatalogo) {
      return null;
    }

    const janelaSolicitada = JANELA_POR_TIPO_SERIE[doCatalogo.tipoSerie];
    const serie = await this.indicadorRepository.buscarSerie(indicadorId, janelaSolicitada);
    if (!serie) {
      return null;
    }

    const { indicador, observacoes } = serie;
    const pontos = observacoes.map((observacao, index) =>
      this.montarPonto(indicador, observacoes, index),
    );

    return {
      indicadorId: indicador.id,
      tipoSerie: indicador.tipoSerie,
      janelaSolicitada,
      historicoCompleto: pontos.length >= janelaSolicitada,
      pontos,
      textoLimitacoes: obterTextoLimitacoes(indicador),
    };
  }

  private montarPonto(indicador: Indicador, observacoes: readonly Observacao[], index: number) {
    const atual = observacoes[index];
    if (!atual) {
      // Inalcancavel - index vem de .map sobre o mesmo array; so satisfaz noUncheckedIndexedAccess.
      throw new Error("indice de observacao invalido ao montar ponto da serie");
    }
    const anterior = observacoes[index - 1];
    // calcular() espera a mais recente primeiro - dentro da janela, "atual" e o proprio
    // ponto e "anterior" e o ponto imediatamente antes dele (nunca fora da janela buscada).
    const janela: Observacao[] = anterior ? [atual, anterior] : [atual];
    return {
      dataReferencia: atual.dataReferencia,
      valor: atual.valor,
      variacao: this.variacaoService.calcular(indicador, janela),
    };
  }
}
