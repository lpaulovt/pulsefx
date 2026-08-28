import type { Pool } from "pg";
import type {
  JobExecucaoRepository,
  RegistroJobExecucao,
} from "../../../domain/sincronizacao/job-execucao-repository.js";
import { pool } from "./client.js";

export class PostgresJobExecucaoRepository implements JobExecucaoRepository {
  constructor(private readonly db: Pick<Pool, "query"> = pool) {}

  async registrar(execucao: RegistroJobExecucao): Promise<void> {
    await this.db.query(
      `INSERT INTO job_execucao (indicador_id, origem, status, detalhe)
       VALUES ($1, $2, $3, $4)`,
      [execucao.indicadorId, execucao.origem, execucao.status, execucao.detalhe ?? null],
    );
  }
}
