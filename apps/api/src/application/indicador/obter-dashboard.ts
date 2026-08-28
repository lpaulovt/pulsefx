import type { DashboardItem } from "@pulsefx/shared-types";
import type { IndicadorRepository } from "../../domain/indicador/indicador-repository.js";
import { VariacaoService } from "../../domain/indicador/variacao-service.js";

/**
 * Caso de uso "obter dashboard" (US1): sempre retorna os 4 indicadores do conjunto
 * fechado, com a variacao calculada pelo VariacaoService compartilhado com o Detalhe
 * (FR-006) - nunca dispara chamada a fonte externa (FR-009), so le o repositorio.
 */
export class ObterDashboard {
  constructor(
    private readonly indicadorRepository: IndicadorRepository,
    private readonly variacaoService: VariacaoService = new VariacaoService(),
  ) {}

  async executar(): Promise<DashboardItem[]> {
    const itens = await this.indicadorRepository.listarComUltimasObservacoes();

    return itens.map(({ indicador, ultimasObservacoes }) => {
      const [maisRecente] = ultimasObservacoes;
      return {
        indicadorId: indicador.id,
        nome: indicador.nome,
        tipoSerie: indicador.tipoSerie,
        ultimoValor: maisRecente?.valor ?? null,
        dataReferencia: maisRecente?.dataReferencia ?? null,
        variacao: this.variacaoService.calcular(indicador, ultimasObservacoes),
      };
    });
  }
}
