import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// Mock do Clerk (sem conta real neste ambiente, ver readme.md secao 4.3) - useUser
// controlado por variavel de modulo, mesmo padrao de MeusIndicadores.test.tsx.
let mockUser: {
  fullName: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  createdAt: Date | null;
} | null = null;

vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ user: mockUser }),
}));

const { Perfil } = await import("../../src/pages/Perfil.js");

describe("Perfil (T003, US2, FR-002/FR-003)", () => {
  afterEach(cleanup);

  it("exibe e-mail e data de criacao, e o nome quando o Clerk tem esse dado", () => {
    mockUser = {
      fullName: "Ana Souza",
      primaryEmailAddress: { emailAddress: "ana@example.com" },
      createdAt: new Date("2026-01-15T00:00:00Z"),
    };

    render(<Perfil />);

    expect(screen.getByText("Ana Souza")).toBeTruthy();
    expect(screen.getByText("ana@example.com")).toBeTruthy();
    expect(screen.getByText(/15\/01\/2026|14\/01\/2026/)).toBeTruthy();
  });

  it("omite o campo de nome (sem 'undefined'/vazio) quando o Clerk nao tem esse dado", () => {
    mockUser = {
      fullName: null,
      primaryEmailAddress: { emailAddress: "sem-nome@example.com" },
      createdAt: new Date("2026-01-15T00:00:00Z"),
    };

    render(<Perfil />);

    expect(screen.queryByText("Nome")).toBeNull();
    expect(screen.queryByText(/undefined/i)).toBeNull();
    expect(screen.getByText("sem-nome@example.com")).toBeTruthy();
  });

  it("oferece link para Meus indicadores (US3, FR-005)", () => {
    mockUser = {
      fullName: null,
      primaryEmailAddress: { emailAddress: "ana@example.com" },
      createdAt: new Date("2026-01-15T00:00:00Z"),
    };

    render(<Perfil />);

    expect(screen.getByRole("link", { name: "Meus indicadores" })).toBeTruthy();
  });
});
