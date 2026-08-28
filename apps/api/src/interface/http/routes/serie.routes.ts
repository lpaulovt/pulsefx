import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ObterSerie } from "../../../application/indicador/obter-serie.js";

const paramsSchema = z.object({ id: z.string().min(1) });

export interface SerieRoutesDeps {
  obterSerie: ObterSerie;
}

// Contract: specs/002-detalhe-serie/contracts/get-serie.md (FR-001..FR-006).
export async function serieRoutes(app: FastifyInstance, deps: SerieRoutesDeps): Promise<void> {
  app.get("/indicadores/:id/serie", async (request, reply) => {
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "invalid_params" });
    }

    const serie = await deps.obterSerie.executar(params.data.id);
    if (!serie) {
      return reply.status(404).send({ error: "indicador_nao_encontrado" });
    }

    return reply.status(200).send(serie);
  });
}
