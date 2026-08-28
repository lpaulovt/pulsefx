// Porta (domain) de persistencia de favoritos - implementada em
// infrastructure/persistence/postgres - domain nunca importa `pg` nem tipo do Clerk
// (so conhece userId: string, ver data-model.md).
export interface FavoritoRepository {
  /** Idempotente - marcar duas vezes o mesmo par nao duplica nem falha (upsert). */
  marcar(userId: string, indicadorId: string): Promise<void>;
  /** Idempotente - desmarcar algo ja desmarcado tambem so retorna. */
  desmarcar(userId: string, indicadorId: string): Promise<void>;
  /** Ids dos indicadores favoritados pelo usuario, em qualquer ordem. */
  listarIndicadorIds(userId: string): Promise<string[]>;
}
