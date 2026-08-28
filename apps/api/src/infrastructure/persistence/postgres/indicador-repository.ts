import type { Pool } from "pg";
import type { Fonte, Indicador, TipoSerie, Unidade } from "../../../domain/indicador/indicador.js";
import type {
  IndicadorComObservacoes,
  IndicadorRepository,
} from "../../../domain/indicador/indicador-repository.js";
import { pool } from "./client.js";

interface Row {
  id: string;
  nome: string;
  tipo_serie: TipoSerie;
  fonte: Fonte;
  unidade: Unidade;
  data_referencia: string | null;
  valor: number | null;
}

export class PostgresIndicadorRepository implements IndicadorRepository {
  constructor(private readonly db: Pick<Pool, "query"> = pool) {}

  async listarComUltimasObservacoes(): Promise<IndicadorComObservacoes[]> {
    // LATERAL join traz, por indicador, as 2 observacoes mais recentes (nunca todo o
    // historico) - e o que o Dashboard/VariacaoService precisam (data-model.md).
    const { rows } = await this.db.query<Row>(
      `SELECT i.id, i.nome, i.tipo_serie, i.fonte, i.unidade,
              o.data_referencia::text AS data_referencia, o.valor::float AS valor
       FROM indicador i
       LEFT JOIN LATERAL (
         SELECT data_referencia, valor
         FROM observacao
         WHERE observacao.indicador_id = i.id
         ORDER BY data_referencia DESC
         LIMIT 2
       ) o ON true
       ORDER BY i.id, o.data_referencia DESC NULLS LAST`,
    );

    const porIndicador = new Map<string, IndicadorComObservacoes>();
    for (const row of rows) {
      const entrada = porIndicador.get(row.id) ?? {
        indicador: {
          id: row.id,
          nome: row.nome,
          tipoSerie: row.tipo_serie,
          fonte: row.fonte,
          unidade: row.unidade,
        } satisfies Indicador,
        ultimasObservacoes: [],
      };
      if (row.data_referencia !== null && row.valor !== null) {
        entrada.ultimasObservacoes.push({
          indicadorId: row.id,
          dataReferencia: row.data_referencia,
          valor: row.valor,
        });
      }
      porIndicador.set(row.id, entrada);
    }
    return [...porIndicador.values()];
  }
}
