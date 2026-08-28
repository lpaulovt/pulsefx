/** Payload minimo que qualquer fonte externa (BCB, FRED) devolve para um indicador. */
export interface ObservacaoBruta {
  /** ISO yyyy-mm-dd, conforme publicado pela fonte. */
  dataReferencia: string;
  valor: number;
}

/**
 * Porta (domain) para clientes de fonte externa. Implementada por BcbClient/FredClient
 * em infrastructure/http-clients - permite ao caso de uso (application) trocar a fonte
 * real por um fake nos testes de integracao (T012).
 */
export interface FonteExternaClient {
  buscarUltimoValor(indicadorId: string): Promise<ObservacaoBruta>;
}
