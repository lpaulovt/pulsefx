import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { env } from "../../../infrastructure/config/env.js";

export async function registerCors(app: FastifyInstance): Promise<void> {
  await app.register(cors, { origin: env.corsOrigin });
}
