import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getAuth } from "@clerk/fastify";
import type { MarcarFavorito } from "../../../application/favorito/marcar-favorito.js";
import type { DesmarcarFavorito } from "../../../application/favorito/desmarcar-favorito.js";
import type { ListarFavoritos } from "../../../application/favorito/listar-favoritos.js";

const paramsSchema = z.object({ indicadorId: z.string().min(1) });

export interface FavoritosRoutesDeps {
  marcarFavorito: MarcarFavorito;
  desmarcarFavorito: DesmarcarFavorito;
  listarFavoritos: ListarFavoritos;
}

// Contract: specs/003-favoritos/contracts/favoritos.md - 401 sem sessao em todas as rotas
// (getAuth vem do clerkPlugin registrado globalmente em server.ts, T004).
export async function favoritosRoutes(app: FastifyInstance, deps: FavoritosRoutesDeps): Promise<void> {
  app.get("/favoritos", async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.status(401).send({ error: "unauthorized" });
    }

    const indicadores = await deps.listarFavoritos.executar(userId);
    return reply.status(200).send({ indicadores });
  });

  app.post("/favoritos/:indicadorId", async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.status(401).send({ error: "unauthorized" });
    }

    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "invalid_params" });
    }

    const marcado = await deps.marcarFavorito.executar(userId, params.data.indicadorId);
    if (!marcado) {
      return reply.status(404).send({ error: "indicador_nao_encontrado" });
    }

    return reply.status(204).send();
  });

  app.delete("/favoritos/:indicadorId", async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.status(401).send({ error: "unauthorized" });
    }

    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "invalid_params" });
    }

    await deps.desmarcarFavorito.executar(userId, params.data.indicadorId);
    return reply.status(204).send();
  });
}
