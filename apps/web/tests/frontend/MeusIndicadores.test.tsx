import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { DashboardResponse } from "@pulsefx/shared-types";

const getFavoritosMock = vi.fn();
const desmarcarFavoritoMock = vi.fn().mockResolvedValue(undefined);
vi.mock("../../src/services/api-client.js", () => ({
  getFavoritos: (...args: unknown[]) => getFavoritosMock(...args),
  marcarFavorito: vi.fn(),
  desmarcarFavorito: (...args: unknown[]) => desmarcarFavoritoMock(...args),
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isSignedIn: true, getToken: vi.fn().mockResolvedValue("token-fake") }),
}));

const { MeusIndicadores } = await import("../../src/pages/MeusIndicadores.js");

const FAVORITO: DashboardResponse["indicadores"][number] = {
  indicadorId: "usd-brl-ptax",
  nome: "USD/BRL (PTAX venda)",
  tipoSerie: "fx-diaria",
  ultimoValor: 5.32,
  dataReferencia: "2026-08-27",
  variacao: { tipo: "calculada", valor: 0.38, unidade: "percentual", sinal: "+" },
};

describe("MeusIndicadores (US2/US3, FR-005/FR-006)", () => {
  afterEach(cleanup);

  it("lista os indicadores favoritados retornados por GET /favoritos", async () => {
    getFavoritosMock.mockResolvedValue({ indicadores: [FAVORITO] } satisfies DashboardResponse);
    render(<MeusIndicadores />);

    expect(await screen.findByText("USD/BRL (PTAX venda)")).toBeTruthy();
  });

  it("estado vazio (FR-006): sem favoritos, mostra mensagem orientando a ir ao Dashboard, nunca tela em branco", async () => {
    getFavoritosMock.mockResolvedValue({ indicadores: [] } satisfies DashboardResponse);
    render(<MeusIndicadores />);

    expect(await screen.findByText(/ainda não marcou nenhum indicador/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();
  });

  it("desfavoritar remove o card da lista na hora, sem esperar reload", async () => {
    getFavoritosMock.mockResolvedValue({ indicadores: [FAVORITO] } satisfies DashboardResponse);
    render(<MeusIndicadores />);

    expect(await screen.findByText("USD/BRL (PTAX venda)")).toBeTruthy();
    screen.getByRole("button", { name: /favorito/i }).click();

    await vi.waitFor(() =>
      expect(desmarcarFavoritoMock).toHaveBeenCalledWith("usd-brl-ptax", "token-fake"),
    );
    expect(screen.queryByText("USD/BRL (PTAX venda)")).toBeNull();
    expect(await screen.findByText(/ainda não marcou nenhum indicador/i)).toBeTruthy();
  });
});
