import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextoLimitacoes } from "../../src/components/TextoLimitacoes.js";

describe("TextoLimitacoes - US2", () => {
  it("exibe o texto vindo da API sem alterar/recalcular o conteudo", () => {
    const texto = "Dado publicado pelo Banco Central do Brasil (SGS). Pode haver defasagem.";

    render(<TextoLimitacoes texto={texto} />);

    expect(screen.getByText(texto)).toBeTruthy();
  });
});
