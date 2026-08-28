import type { Pool } from "pg";
import type { Observacao } from "../../../domain/indicador/observacao.js";
import type { ObservacaoRepository } from "../../../domain/sincronizacao/observacao-repository.js";
import { pool } from "./client.js";

export class PostgresObservacaoRepository implements ObservacaoRepository {
  constructor(private readonly db: Pick<Pool, "query"> = pool) {}

  async salvar(observacao: Observacao): Promise<void> {
    await this.db.query(
      `INSERT INTO observacao (indicador_id, data_referencia, valor)
       VALUES ($1, $2, $3)
       ON CONFLICT (indicador_id, data_referencia)
       DO UPDATE SET valor = EXCLUDED.valor`,
      [observacao.indicadorId, observacao.dataReferencia, observacao.valor],
    );
  }
}
