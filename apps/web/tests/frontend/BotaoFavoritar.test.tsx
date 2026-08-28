import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const marcarFavoritoMock = vi.fn();
const desmarcarFavoritoMock = vi.fn();
vi.mock("../../src/services/api-client.js", () => ({
  marcarFavorito: (...args: unknown[]) => marcarFavoritoMock(...args),
  desmarcarFavorito: (...args: unknown[]) => desmarcarFavoritoMock(...args),
}));

let isSignedIn = true;
const getTokenMock = vi.fn().mockResolvedValue("token-fake");
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isSignedIn, getToken: getTokenMock }),
}));

const { BotaoFavoritar } = await import("../../src/components/BotaoFavoritar.js");

describe("BotaoFavoritar (T013, FR-001/FR-002/FR-004)", () => {
  afterEach(cleanup);
  beforeEach(() => {
    isSignedIn = true;
    marcarFavoritoMock.mockReset().mockResolvedValue(undefined);
    desmarcarFavoritoMock.mockReset().mockResolvedValue(undefined);
    window.location.hash = "";
  });

  it("clique com sessao valida marca o favorito (efeito imediato otimista)", async () => {
    render(<BotaoFavoritar indicadorId="usd-brl-ptax" />);

    screen.getByRole("button").click();
    await vi.waitFor(() => expect(marcarFavoritoMock).toHaveBeenCalledWith("usd-brl-ptax", "token-fake"));

    expect(screen.getByRole("button", { pressed: true })).toBeTruthy();
  });

  it("segundo clique desmarca o favorito ja marcado", async () => {
    render(<BotaoFavoritar indicadorId="usd-brl-ptax" favoritadoInicial />);

    screen.getByRole("button").click();
    await vi.waitFor(() => expect(desmarcarFavoritoMock).toHaveBeenCalledWith("usd-brl-ptax", "token-fake"));

    expect(screen.getByRole("button", { pressed: false })).toBeTruthy();
  });

  it("sem sessao, clique nunca chama a API - direciona para Login (FR-004)", async () => {
    isSignedIn = false;
    render(<BotaoFavoritar indicadorId="usd-brl-ptax" />);

    screen.getByRole("button").click();

    expect(marcarFavoritoMock).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("#login");
  });

  it("falha na API reverte o estado otimista", async () => {
    marcarFavoritoMock.mockRejectedValue(new Error("falhou"));
    render(<BotaoFavoritar indicadorId="usd-brl-ptax" />);

    screen.getByRole("button").click();
    await vi.waitFor(() => expect(marcarFavoritoMock).toHaveBeenCalled());

    expect(screen.getByRole("button", { pressed: false })).toBeTruthy();
  });
});
