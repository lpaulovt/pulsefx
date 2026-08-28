import { buildServer } from "./interface/http/server.js";
import { env } from "./infrastructure/config/env.js";

async function main(): Promise<void> {
  const app = await buildServer();
  await app.listen({ port: env.port, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
