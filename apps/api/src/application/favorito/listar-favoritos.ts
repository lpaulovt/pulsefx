import type { DashboardItem } from "@pulsefx/shared-types";
import type { FavoritoRepository } from "../../domain/favorito/favorito-repository.js";
import type { ObterDashboard } from "../indicador/obter-dashboard.js";

/**
 * Caso de uso "listar favoritos" (US2) - reaproveita ObterDashboard (specs/001-dashboard)
 * para nao duplicar a regra de variacao/formatacao (mesmo shape de DashboardItem),
 * filtrando pelos indicadores favoritados do usuario autenticado (contracts/favoritos.md).
 */
export class ListarFavoritos {
  constructor(
    private readonly obterDashboard: ObterDashboard,
    private readonly favoritoRepository: FavoritoRepository,
  ) {}

  async executar(userId: string): Promise<DashboardItem[]> {
    const [dashboard, favoritoIds] = await Promise.all([
      this.obterDashboard.executar(),
      this.favoritoRepository.listarIndicadorIds(userId),
    ]);
    const favoritoIdsSet = new Set(favoritoIds);
    return dashboard.filter((item) => favoritoIdsSet.has(item.indicadorId));
  }
}
