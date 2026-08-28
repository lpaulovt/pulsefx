import Fastify, { type FastifyInstance } from "fastify";
import { registerCors } from "./plugins/cors.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { healthRoutes } from "./routes/health.routes.js";
import { adminSyncRoutes, type AdminSyncRoutesDeps } from "./routes/admin-sync.routes.js";

export type ServerDeps = AdminSyncRoutesDeps;

export async function buildServer(deps: ServerDeps): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  registerErrorHandler(app);
  await registerCors(app);

  await app.register(healthRoutes);
  await app.register((instance) => adminSyncRoutes(instance, deps));

  return app;
}
