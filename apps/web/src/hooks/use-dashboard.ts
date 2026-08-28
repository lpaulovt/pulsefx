import { useEffect, useState } from "react";
import type { DashboardItem } from "@pulsefx/shared-types";
import { getDashboard } from "../services/api-client.js";

export interface UseDashboardResult {
  indicadores: DashboardItem[];
  carregando: boolean;
  erro: string | null;
}

/** Fetch + estado do Dashboard - le so a API propria (FR-009), nunca BCB/FRED direto. */
export function useDashboard(): UseDashboardResult {
  const [indicadores, setIndicadores] = useState<DashboardItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    getDashboard()
      .then((resposta) => {
        if (ativo) setIndicadores(resposta.indicadores);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Erro ao carregar indicadores");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { indicadores, carregando, erro };
}
