import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

// Mock do Clerk (sem conta real neste ambiente, ver readme.md secao 4.3) - SignIn/SignUp
// reais fariam chamada de rede a Clerk; aqui so verificamos que a pagina os monta.
vi.mock("@clerk/clerk-react", () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
  SignUp: () => <div data-testid="clerk-sign-up" />,
}));

const { Login } = await import("../../src/pages/Login.js");

describe("Login (T007, FR-004a, issue #51)", () => {
  afterEach(cleanup);

  it("mostra so SignIn por padrao, nao os dois formularios empilhados", () => {
    render(<Login />);

    expect(screen.getByTestId("clerk-sign-in")).toBeTruthy();
    expect(screen.queryByTestId("clerk-sign-up")).toBeNull();
  });

  it("alterna para SignUp ao clicar em 'Cadastre-se', escondendo o SignIn", () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/Cadastre-se/i));

    expect(screen.getByTestId("clerk-sign-up")).toBeTruthy();
    expect(screen.queryByTestId("clerk-sign-in")).toBeNull();
  });

  it("alterna de volta para SignIn ao clicar em 'Entrar'", () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/Cadastre-se/i));
    fireEvent.click(screen.getByText(/Já tem conta\? Entrar/i));

    expect(screen.getByTestId("clerk-sign-in")).toBeTruthy();
    expect(screen.queryByTestId("clerk-sign-up")).toBeNull();
  });

  it("oferece link de volta ao Dashboard", () => {
    render(<Login />);

    expect(screen.getByText(/Voltar ao Dashboard/i)).toBeTruthy();
  });
});
