import { useFavoritos } from "../hooks/use-favoritos.js";
import { IndicadorCard } from "../components/IndicadorCard.js";
import styles from "./MeusIndicadores.module.css";

export function MeusIndicadores() {
  const { indicadores, carregando, erro } = useFavoritos();

  return (
    <main className="pf-page">
      <h1>Meus indicadores</h1>
      {carregando && <p className="pf-state">Carregando favoritos...</p>}
      {erro && (
        <p role="alert" className="pf-erro">
          {erro}
        </p>
      )}
      {!carregando && !erro && indicadores.length === 0 && (
        // FR-006 (US3): estado vazio explicito, nunca tela em branco.
        <p className={styles.vazio}>
          Você ainda não marcou nenhum indicador como favorito. Vá ao{" "}
          <a href="#">Dashboard</a> e escolha os indicadores que quer acompanhar aqui.
        </p>
      )}
      <div className="pf-grid">
        {indicadores.map((item) => (
          <a key={item.indicadorId} href={`#${item.indicadorId}`} className="pf-card-link">
            <IndicadorCard item={item} favoritado />
          </a>
        ))}
      </div>
    </main>
  );
}
