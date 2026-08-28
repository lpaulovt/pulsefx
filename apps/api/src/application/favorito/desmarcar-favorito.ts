import type { FavoritoRepository } from "../../domain/favorito/favorito-repository.js";

/** Caso de uso "desmarcar favorito" (US1) - idempotente, sempre 204 mesmo se nao existia. */
export class DesmarcarFavorito {
  constructor(private readonly favoritoRepository: FavoritoRepository) {}

  async executar(userId: string, indicadorId: string): Promise<void> {
    await this.favoritoRepository.desmarcar(userId, indicadorId);
  }
}
