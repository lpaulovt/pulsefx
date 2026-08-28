import type { DashboardResponse, SerieResponse } from "@pulsefx/shared-types";

// Unico ponto que fala HTTP com a API propria do Pulse FX - nunca chama BCB/FRED
// direto (dev-front-end.md). Base URL vem de VITE_API_BASE_URL (unica env exposta ao
// bundle, ver .env.example).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function getDashboard(): Promise<DashboardResponse> {
  const resposta = await fetch(`${API_BASE_URL}/indicadores`);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar indicadores (HTTP ${resposta.status})`);
  }
  return (await resposta.json()) as DashboardResponse;
}

export async function getSerie(indicadorId: string): Promise<SerieResponse> {
  const resposta = await fetch(`${API_BASE_URL}/indicadores/${encodeURIComponent(indicadorId)}/serie`);
  if (resposta.status === 404) {
    throw new Error("Indicador nao encontrado");
  }
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar serie (HTTP ${resposta.status})`);
  }
  return (await resposta.json()) as SerieResponse;
}
