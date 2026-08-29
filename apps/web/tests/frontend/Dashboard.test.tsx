import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("../../src/services/api-client.js", () => ({
  getDashboard: vi.fn().mockResolvedValue({ indicadores: [] }),
  getFavoritos: vi.fn().mockResolvedValue({ indicadores: [] }),
}));

// Mock do Clerk (sem conta real neste ambiente) - SignedIn/SignedOut/UserButton/useAuth
// controlados por uma flag de modulo, mesmo padrao de App.test.tsx (issue #51). useAuth
// e' usado tanto pelo header (issue #51) quanto por useFavoritos (bug do estado de
// favorito nao refletir apos reload).
let signedIn = false;
vi.mock("@clerk/clerk-react", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (signedIn ? <>{children}</> : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (signedIn ? null : <>{children}</>),
  UserButton: () => <div data-testid="clerk-user-button" />,
  useAuth: () => ({ isSignedIn: signedIn, getToken: vi.fn().mockResolvedValue("token-fake") }),
}));

const { Dashboard } = await import("../../src/pages/Dashboard.js");

describe("Dashboard - US3 disclaimer", () => {
  afterEach(() => {
    signedIn = false;
    cleanup();
  });

  it("mostra o disclaimer educacional na renderizacao inicial, sem nenhuma interacao", () => {
    render(<Dashboard />);

    expect(
      screen.getByText(/não é recomendação de investimento/i),
    ).toBeTruthy();
  });

  it("sem sessao, mostra link Entrar no topo (issue #51)", () => {
    render(<Dashboard />);

    expect(screen.getByRole("link", { name: "Entrar" })).toBeTruthy();
    expect(screen.queryByTestId("clerk-user-button")).toBeNull();
  });

  it("com sessao, mostra o UserButton (avatar) no topo em vez do link Entrar (issue #51)", () => {
    signedIn = true;
    render(<Dashboard />);

    expect(screen.getByTestId("clerk-user-button")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Entrar" })).toBeNull();
  });
});

describe("Dashboard - estado de favorito reflete GET /favoritos", () => {
  afterEach(() => {
    signedIn = false;
    cleanup();
  });

  it("indicador ja favoritado aparece marcado no card do Dashboard, nao so em Meus indicadores", async () => {
    const { getDashboard, getFavoritos } = await import("../../src/services/api-client.js");
    const item = {
      indicadorId: "usd-brl-ptax",
      nome: "USD/BRL (PTAX venda)",
      tipoSerie: "fx-diaria" as const,
      ultimoValor: 5.2,
      dataReferencia: "2026-08-28",
      variacao: { tipo: "indisponivel" as const, motivo: "sem_observacao" as const },
    };
    vi.mocked(getDashboard).mockResolvedValueOnce({ indicadores: [item] });
    vi.mocked(getFavoritos).mockResolvedValueOnce({ indicadores: [item] });
    signedIn = true;

    render(<Dashboard />);

    const botao = await screen.findByRole("button", { name: /favorito/i });
    expect(botao.getAttribute("aria-pressed")).toBe("true");
  });
});
