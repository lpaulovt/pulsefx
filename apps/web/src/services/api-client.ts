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

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// contracts/favoritos.md (specs/003-favoritos) - exige sessao Clerk (401 sem token).
export async function marcarFavorito(indicadorId: string, token: string | null): Promise<void> {
  const resposta = await fetch(`${API_BASE_URL}/favoritos/${encodeURIComponent(indicadorId)}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao marcar favorito (HTTP ${resposta.status})`);
  }
}

export async function desmarcarFavorito(indicadorId: string, token: string | null): Promise<void> {
  const resposta = await fetch(`${API_BASE_URL}/favoritos/${encodeURIComponent(indicadorId)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao desmarcar favorito (HTTP ${resposta.status})`);
  }
}

// GET /favoritos (US2) - mesmo shape de DashboardResponse (contracts/favoritos.md), so
// os indicadores favoritados do usuario autenticado.
export async function getFavoritos(token: string | null): Promise<DashboardResponse> {
  const resposta = await fetch(`${API_BASE_URL}/favoritos`, { headers: authHeaders(token) });
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar favoritos (HTTP ${resposta.status})`);
  }
  return (await resposta.json()) as DashboardResponse;
}
