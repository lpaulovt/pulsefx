import { CATALOGO_INDICADORES } from "../../domain/indicador/catalogo.js";
import type { FavoritoRepository } from "../../domain/favorito/favorito-repository.js";

/**
 * Caso de uso "marcar favorito" (US1) - so aceita indicadores do conjunto fechado do
 * MVP (contracts/favoritos.md: 404 para id desconhecido); upsert idempotente delegado
 * ao FavoritoRepository.
 */
export class MarcarFavorito {
  constructor(
    private readonly favoritoRepository: FavoritoRepository,
    private readonly indicadores: readonly { id: string }[] = CATALOGO_INDICADORES,
  ) {}

  /** false quando indicadorId nao existe no conjunto fechado do MVP (404 na rota). */
  async executar(userId: string, indicadorId: string): Promise<boolean> {
    const existe = this.indicadores.some((indicador) => indicador.id === indicadorId);
    if (!existe) {
      return false;
    }
    await this.favoritoRepository.marcar(userId, indicadorId);
    return true;
  }
}
