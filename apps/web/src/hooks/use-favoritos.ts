import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { DashboardItem } from "@pulsefx/shared-types";
import { getFavoritos } from "../services/api-client.js";

export interface UseFavoritosResult {
  indicadores: DashboardItem[];
  carregando: boolean;
  erro: string | null;
}

/** Fetch autenticado de GET /favoritos (US2) - fonte de verdade e o backend (FR-003). */
export function useFavoritos(): UseFavoritosResult {
  const { getToken } = useAuth();
  const [indicadores, setIndicadores] = useState<DashboardItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    getToken()
      .then((token) => getFavoritos(token))
      .then((resposta) => {
        if (ativo) setIndicadores(resposta.indicadores);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Erro ao carregar favoritos");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [getToken]);

  return { indicadores, carregando, erro };
}
