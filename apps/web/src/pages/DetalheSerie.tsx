import { useSerie } from "../hooks/use-serie.js";
import { SerieTabela } from "../components/SerieTabela.js";
import { TextoLimitacoes } from "../components/TextoLimitacoes.js";
import { Disclaimer } from "../components/Disclaimer.js";
import styles from "./DetalheSerie.module.css";

export function DetalheSerie({ indicadorId }: { indicadorId: string }) {
  const { serie, carregando, erro } = useSerie(indicadorId);

  return (
    <main className="pf-page">
      <p>
        <a href="#" className="pf-voltar">
          &larr; Voltar ao Dashboard
        </a>
      </p>
      <h1 className={styles.titulo}>{indicadorId}</h1>
      <Disclaimer />
      {carregando && <p className="pf-state">Carregando serie...</p>}
      {erro && (
        <p role="alert" className="pf-erro">
          {erro}
        </p>
      )}
      {serie && (
        <>
          {/* FR-003: histórico incompleto nunca é preenchido com dado interpolado, so avisado. */}
          {!serie.historicoCompleto && (
            <p role="status" className={styles.parcial}>
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
