import type { FastifyInstance } from "fastify";

// Formato de erro unico em toda a API - nunca vaza stack trace/detalhe interno pro cliente.
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? "internal_server_error" : error.message,
    });
  });
}
