import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CATALOGO_INDICADORES } from "../../../domain/indicador/catalogo.js";
import type { SincronizarIndicador } from "../../../application/sincronizacao/sincronizar-indicador.js";
import { verificarAdminKey } from "../plugins/admin-auth.js";

const corpoSchema = z.object({
  indicadorId: z.string().optional(),
});

export interface AdminSyncRoutesDeps {
  sincronizarIndicador: SincronizarIndicador;
}

// Contract: specs/004-sincronizacao/contracts/admin-sync.md (FR-003/FR-004).
export async function adminSyncRoutes(app: FastifyInstance, deps: AdminSyncRoutesDeps): Promise<void> {
  app.post("/admin/sync", { preHandler: verificarAdminKey }, async (request, reply) => {
    const corpo = corpoSchema.safeParse(request.body ?? {});
    if (!corpo.success) {
      return reply.status(400).send({ error: "invalid_body" });
    }

    const { indicadorId } = corpo.data;
    const indicadores = indicadorId
      ? CATALOGO_INDICADORES.filter((indicador) => indicador.id === indicadorId)
      : CATALOGO_INDICADORES;

    if (indicadorId && indicadores.length === 0) {
      return reply.status(400).send({ error: "unknown_indicador" });
    }

    // Disparo assincrono - a resposta nunca espera a fonte externa nem vira 5xx por
    // falha dela (SincronizarIndicador ja captura e loga em JobExecucao).
    for (const indicador of indicadores) {
      void deps.sincronizarIndicador.executar(indicador, "admin");
    }

    return reply.status(202).send({
      status: "accepted",
      indicadores: indicadores.map((indicador) => indicador.id),
    });
  });
}
