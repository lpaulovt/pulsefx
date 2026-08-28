import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// Mock do Clerk (sem conta real neste ambiente, ver readme.md secao 4.3) - SignIn/SignUp
// reais fariam chamada de rede a Clerk; aqui so verificamos que a pagina os monta.
vi.mock("@clerk/clerk-react", () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
  SignUp: () => <div data-testid="clerk-sign-up" />,
}));

const { Login } = await import("../../src/pages/Login.js");

describe("Login (T007, FR-004a)", () => {
  afterEach(cleanup);

  it("monta SignIn e SignUp do Clerk - unico ponto de autenticacao do MVP", () => {
    render(<Login />);

    expect(screen.getByTestId("clerk-sign-in")).toBeTruthy();
    expect(screen.getByTestId("clerk-sign-up")).toBeTruthy();
  });

  it("oferece link de volta ao Dashboard", () => {
    render(<Login />);

    expect(screen.getByText(/Voltar ao Dashboard/i)).toBeTruthy();
  });
});
