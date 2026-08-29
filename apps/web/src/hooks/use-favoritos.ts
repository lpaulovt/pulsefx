import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { DashboardItem } from "@pulsefx/shared-types";
import { getFavoritos } from "../services/api-client.js";

export interface UseFavoritosResult {
  indicadores: DashboardItem[];
  carregando: boolean;
  erro: string | null;
}

/**
 * Fetch autenticado de GET /favoritos (US2) - fonte de verdade e o backend (FR-003).
 * Chamavel de tela publica (ex.: Dashboard, pra saber quais indicadores ja estao
 * favoritados) - sem sessao, nao dispara a chamada (evita 401 esperado toda vez que um
 * visitante anonimo abre o Dashboard).
 */
export function useFavoritos(): UseFavoritosResult {
  const { isSignedIn, getToken } = useAuth();
  const [indicadores, setIndicadores] = useState<DashboardItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    if (!isSignedIn) {
      setIndicadores([]);
      setErro(null);
      setCarregando(false);
      return;
    }

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
    // getToken fora do array de dependencias de proposito: e' recriado a cada render em
    // mocks de teste (novo vi.fn() por chamada de useAuth()) - se entrasse na dependencia,
    // o efeito reexecutaria a cada render disparado por ele mesmo (loop, trava o worker do
    // Vitest). So isSignedIn deve re-disparar o fetch; getToken e' sempre lido "fresco" via
    // closure no momento em que o efeito roda.
  }, [isSignedIn]);

  return { indicadores, carregando, erro };
}
