import type { Fonte, Indicador } from "../../domain/indicador/indicador.js";
import type { FonteExternaClient } from "../../domain/sincronizacao/fonte-externa-client.js";
import type { JobExecucaoRepository, OrigemJob } from "../../domain/sincronizacao/job-execucao-repository.js";
import type { ObservacaoRepository } from "../../domain/sincronizacao/observacao-repository.js";
import { normalizarObservacao } from "../../domain/sincronizacao/normalizar-observacao.js";

/**
 * Caso de uso "executar sincronizacao" de um indicador: busca o ultimo valor na fonte
 * externa correspondente, normaliza e persiste. Nunca e chamado por requisicao de
 * usuario final (FR-005) - so pelo scheduler (T014) ou pelo endpoint admin (US2).
 */
export class SincronizarIndicador {
  constructor(
    private readonly clients: Record<Fonte, FonteExternaClient>,
    private readonly observacaoRepository: ObservacaoRepository,
    private readonly jobExecucaoRepository: JobExecucaoRepository,
  ) {}

  async executar(indicador: Indicador, origem: OrigemJob): Promise<void> {
    try {
      const bruta = await this.clients[indicador.fonte].buscarUltimoValor(indicador.id);
      const observacao = normalizarObservacao(indicador.id, bruta);
      await this.observacaoRepository.salvar(observacao);
      await this.jobExecucaoRepository.registrar({
        indicadorId: indicador.id,
        origem,
        status: "sucesso",
      });
    } catch (erro) {
      // Falha da fonte externa (ou payload invalido) nunca propaga - ultimo dado valido
      // persistido continua servindo Dashboard/Detalhe (FR-006).
      await this.jobExecucaoRepository.registrar({
        indicadorId: indicador.id,
        origem,
        status: "falha_fonte_externa",
        detalhe: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }
}
