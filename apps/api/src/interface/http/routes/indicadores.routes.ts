import type { FastifyInstance } from "fastify";
import type { ObterDashboard } from "../../../application/indicador/obter-dashboard.js";

export interface IndicadoresRoutesDeps {
  obterDashboard: ObterDashboard;
}

// Contract: specs/001-dashboard/contracts/get-indicadores.md (FR-001, FR-009).
export async function indicadoresRoutes(app: FastifyInstance, deps: IndicadoresRoutesDeps): Promise<void> {
  app.get("/indicadores", async (_request, reply) => {
    const indicadores = await deps.obterDashboard.executar();
    return reply.status(200).send({ indicadores });
  });
}
