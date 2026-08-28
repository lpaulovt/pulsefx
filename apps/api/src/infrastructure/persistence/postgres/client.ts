// Pool unico do driver `pg` cru (sem ORM - ver ADR no README/relatorio de arquitetura).
import { Pool } from "pg";
import { env } from "../../config/env.js";

export const pool = new Pool({ connectionString: env.databaseUrl });
