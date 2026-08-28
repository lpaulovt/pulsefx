import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../src/services/api-client.js", () => ({
  getDashboard: vi.fn().mockResolvedValue({ indicadores: [] }),
}));

const { Dashboard } = await import("../../src/pages/Dashboard.js");

describe("Dashboard - US3 disclaimer", () => {
  it("mostra o disclaimer educacional na renderizacao inicial, sem nenhuma interacao", () => {
    render(<Dashboard />);

    expect(
      screen.getByText(/não é recomendação de investimento/i),
    ).toBeTruthy();
  });
});
