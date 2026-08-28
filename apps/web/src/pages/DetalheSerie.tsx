import { useSerie } from "../hooks/use-serie.js";
import { SerieTabela } from "../components/SerieTabela.js";
import { TextoLimitacoes } from "../components/TextoLimitacoes.js";
import { Disclaimer } from "../components/Disclaimer.js";

export function DetalheSerie({ indicadorId }: { indicadorId: string }) {
  const { serie, carregando, erro } = useSerie(indicadorId);

  return (
    <main>
      <p>
        <a href="#">&larr; Voltar ao Dashboard</a>
      </p>
      <h1>{indicadorId}</h1>
      <Disclaimer />
      {carregando && <p>Carregando serie...</p>}
      {erro && <p role="alert">{erro}</p>}
      {serie && (
        <>
          {/* FR-003: histórico incompleto nunca é preenchido com dado interpolado, so avisado. */}
          {!serie.historicoCompleto && (
            <p role="status">
              Histórico ainda sendo formado: {serie.pontos.length} de {serie.janelaSolicitada}{" "}
              observações disponíveis.
            </p>
          )}
          <SerieTabela pontos={serie.pontos} />
          <TextoLimitacoes texto={serie.textoLimitacoes} />
        </>
      )}
    </main>
  );
}
