import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// Mock do Clerk (sem conta real neste ambiente) - SignedIn/SignedOut controlados
// por uma flag de modulo, sem ClerkProvider real nem chamada de rede.
let signedIn = false;
vi.mock("@clerk/clerk-react", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (signedIn ? <>{children}</> : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (signedIn ? null : <>{children}</>),
}));

vi.mock("../../src/pages/Dashboard.js", () => ({ Dashboard: () => <p>Dashboard page</p> }));
vi.mock("../../src/pages/DetalheSerie.js", () => ({ DetalheSerie: () => <p>Detalhe page</p> }));
vi.mock("../../src/pages/Login.js", () => ({ Login: () => <p>Login page</p> }));
vi.mock("../../src/pages/MeusIndicadores.js", () => ({
  MeusIndicadores: () => <p>Meus indicadores page</p>,
}));
vi.mock("../../src/pages/Perfil.js", () => ({ Perfil: () => <p>Perfil page</p> }));

const { App } = await import("../../src/App.js");

describe("App - guarda de rota Meus indicadores (T008, FR-004)", () => {
  afterEach(cleanup);
  beforeEach(() => {
    signedIn = false;
    window.location.hash = "";
  });

  it("sem sessao, acessar #meus-indicadores mostra Login em vez do conteudo protegido", () => {
    window.location.hash = "#meus-indicadores";
    render(<App />);

    expect(screen.getByText("Login page")).toBeTruthy();
  });

  it("com sessao, acessar #meus-indicadores nao redireciona para Login", () => {
    signedIn = true;
    window.location.hash = "#meus-indicadores";
    render(<App />);

    expect(screen.queryByText("Login page")).toBeNull();
  });

  it("sem sessao, acessar #perfil mostra Login em vez do conteudo protegido (T004, FR-004)", () => {
    window.location.hash = "#perfil";
    render(<App />);

    expect(screen.getByText("Login page")).toBeTruthy();
  });

  it("com sessao, acessar #perfil nao redireciona para Login (T004)", () => {
    signedIn = true;
    window.location.hash = "#perfil";
    render(<App />);

    expect(screen.queryByText("Login page")).toBeNull();
    expect(screen.getByText("Perfil page")).toBeTruthy();
  });

  it("#login mostra a pagina de login independente de sessao", () => {
    window.location.hash = "#login";
    render(<App />);

    expect(screen.getByText("Login page")).toBeTruthy();
  });

  it("sem hash continua mostrando o Dashboard (rota publica, sem Clerk envolvido)", () => {
    render(<App />);

    expect(screen.getByText("Dashboard page")).toBeTruthy();
  });
});
