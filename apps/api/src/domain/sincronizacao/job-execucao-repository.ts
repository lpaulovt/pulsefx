export type OrigemJob = "agendado" | "admin";
export type StatusJob = "sucesso" | "falha_fonte_externa";

export interface RegistroJobExecucao {
  indicadorId: string;
  origem: OrigemJob;
  status: StatusJob;
  detalhe?: string;
}

/**
 * Porta (domain) para o log de auditoria de execucao do job (data-model.md) - torna
 * FR-006 (falha nao derruba o produto) verificavel em teste de integracao.
 */
export interface JobExecucaoRepository {
  registrar(execucao: RegistroJobExecucao): Promise<void>;
}
