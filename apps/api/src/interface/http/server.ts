import Fastify, { type FastifyInstance } from "fastify";
import { registerCors } from "./plugins/cors.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { registerClerkAuth } from "../../infrastructure/auth/clerk-plugin.js";
import { healthRoutes } from "./routes/health.routes.js";
import { adminSyncRoutes, type AdminSyncRoutesDeps } from "./routes/admin-sync.routes.js";
import { indicadoresRoutes, type IndicadoresRoutesDeps } from "./routes/indicadores.routes.js";
import { serieRoutes, type SerieRoutesDeps } from "./routes/serie.routes.js";

export type ServerDeps = AdminSyncRoutesDeps & IndicadoresRoutesDeps & SerieRoutesDeps;

export async function buildServer(deps: ServerDeps): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  registerErrorHandler(app);
  await registerCors(app);
  await registerClerkAuth(app);

  await app.register(healthRoutes);
  await app.register((instance) => adminSyncRoutes(instance, deps));
  await app.register((instance) => indicadoresRoutes(instance, deps));
  await app.register((instance) => serieRoutes(instance, deps));

  return app;
}
