import type { Fonte, Indicador } from "../../domain/indicador/indicador.js";
import type { FonteExternaClient, ObservacaoBruta } from "../../domain/sincronizacao/fonte-externa-client.js";
import type { JobExecucaoRepository, OrigemJob } from "../../domain/sincronizacao/job-execucao-repository.js";
import type { ObservacaoRepository } from "../../domain/sincronizacao/observacao-repository.js";
import { normalizarObservacao } from "../../domain/sincronizacao/normalizar-observacao.js";

// research.md: sem retry agressivo - 1 tentativa + 1 retry com backoff fixo curto.
const RETRY_BACKOFF_MS = 5000;

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
    private readonly aguardar: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}

  async executar(indicador: Indicador, origem: OrigemJob): Promise<void> {
    try {
      const bruta = await this.buscarComRetry(indicador);
      const observacao = normalizarObservacao(indicador.id, bruta);
      await this.observacaoRepository.salvar(observacao);
      await this.jobExecucaoRepository.registrar({
        indicadorId: indicador.id,
        origem,
        status: "sucesso",
      });
    } catch (erro) {
      // Falha da fonte externa (ou payload invalido), mesmo apos o retry, nunca propaga -
      // ultimo dado valido persistido continua servindo Dashboard/Detalhe (FR-006, US3).
      await this.jobExecucaoRepository.registrar({
        indicadorId: indicador.id,
        origem,
        status: "falha_fonte_externa",
        detalhe: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }

  private async buscarComRetry(indicador: Indicador): Promise<ObservacaoBruta> {
    const client = this.clients[indicador.fonte];
    try {
      return await client.buscarUltimoValor(indicador.id);
    } catch {
      await this.aguardar(RETRY_BACKOFF_MS);
      return client.buscarUltimoValor(indicador.id);
    }
  }
}
