import type { FastifyInstance } from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { env } from "../config/env.js";

// Unico ponto que importa @clerk/fastify (research.md) - anexa request.auth para as
// rotas de favoritos usarem getAuth(request). Domain nunca conhece este modulo.
export async function registerClerkAuth(app: FastifyInstance): Promise<void> {
  await app.register(clerkPlugin, {
    secretKey: env.clerkSecretKey,
    publishableKey: env.clerkPublishableKey,
  });
}
