import { useDashboard } from "../hooks/use-dashboard.js";
import { IndicadorCard } from "../components/IndicadorCard.js";
import { Disclaimer } from "../components/Disclaimer.js";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const { indicadores, carregando, erro } = useDashboard();

  return (
    <main className="pf-page">
      <h1 className={styles.marca}>
        {/* Assinatura visual (issue #47): traco de pulso ligado ao nome do produto,
            desenhado uma vez no load - respeita prefers-reduced-motion via tokens.css. */}
        <svg
          className={styles.pulso}
          width="28"
          height="20"
          viewBox="0 0 28 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 10h6l2.5-7 4 14 3-10 2 3h10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Pulse FX
      </h1>
      <Disclaimer />
      {carregando && <p className="pf-state">Carregando indicadores...</p>}
      {erro && (
        <p role="alert" className="pf-erro">
          {erro}
        </p>
      )}
      <div className="pf-grid">
        {indicadores.map((item) => (
          <a key={item.indicadorId} href={`#${item.indicadorId}`} className="pf-card-link">
            <IndicadorCard item={item} />
          </a>
        ))}
      </div>
    </main>
  );
}
