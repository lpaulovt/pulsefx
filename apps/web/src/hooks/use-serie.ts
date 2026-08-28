import { useEffect, useState } from "react";
import type { SerieResponse } from "@pulsefx/shared-types";
import { getSerie } from "../services/api-client.js";

export interface UseSerieResult {
  serie: SerieResponse | null;
  carregando: boolean;
  erro: string | null;
}

/** Fetch + estado do Detalhe de serie - le so a API propria (Pulse FX), nunca BCB/FRED direto. */
export function useSerie(indicadorId: string): UseSerieResult {
  const [serie, setSerie] = useState<SerieResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    setSerie(null);

    getSerie(indicadorId)
      .then((resposta) => {
        if (ativo) setSerie(resposta);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Erro ao carregar serie");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [indicadorId]);

  return { serie, carregando, erro };
}
