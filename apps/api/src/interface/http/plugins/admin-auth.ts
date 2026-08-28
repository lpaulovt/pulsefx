import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../../infrastructure/config/env.js";

// Protecao do endpoint POST /admin/sync (FR-004) - header X-Admin-Key comparado a
// ADMIN_SYNC_KEY (research.md: chave simples, sem acoplar ao Clerk de specs/003-favoritos).
export async function verificarAdminKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const chaveRecebida = request.headers["x-admin-key"];
  if (!env.adminSyncKey || chaveRecebida !== env.adminSyncKey) {
    await reply.status(401).send({ error: "unauthorized" });
  }
}
