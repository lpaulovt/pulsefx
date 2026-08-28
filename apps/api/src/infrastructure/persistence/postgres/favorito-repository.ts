import type { Pool } from "pg";
import type { FavoritoRepository } from "../../../domain/favorito/favorito-repository.js";
import { pool } from "./client.js";

export class PostgresFavoritoRepository implements FavoritoRepository {
  constructor(private readonly db: Pick<Pool, "query"> = pool) {}

  async marcar(userId: string, indicadorId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO favorito (user_id, indicador_id) VALUES ($1, $2)
       ON CONFLICT (user_id, indicador_id) DO NOTHING`,
      [userId, indicadorId],
    );
  }

  async desmarcar(userId: string, indicadorId: string): Promise<void> {
    await this.db.query("DELETE FROM favorito WHERE user_id = $1 AND indicador_id = $2", [
      userId,
      indicadorId,
    ]);
  }

  async listarIndicadorIds(userId: string): Promise<string[]> {
    const { rows } = await this.db.query<{ indicador_id: string }>(
      "SELECT indicador_id FROM favorito WHERE user_id = $1",
      [userId],
    );
    return rows.map((row) => row.indicador_id);
  }
}
