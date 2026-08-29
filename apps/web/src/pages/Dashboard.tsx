import { useMemo } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useDashboard } from "../hooks/use-dashboard.js";
import { useFavoritos } from "../hooks/use-favoritos.js";
import { IndicadorCard } from "../components/IndicadorCard.js";
import { Disclaimer } from "../components/Disclaimer.js";
import { appearanceClerk } from "../lib/clerk-appearance.js";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const { indicadores, carregando, erro } = useDashboard();
  // Sem sessao, useFavoritos() ja retorna lista vazia sem chamar a API (ver hook) -
  // card sempre nasce "nao favoritado" pra visitante anonimo, correto.
  const { indicadores: favoritos } = useFavoritos();
  const favoritosIds = useMemo(
    () => new Set(favoritos.map((item) => item.indicadorId)),
    [favoritos],
  );
  // useMemo: getComputedStyle nao muda entre re-renders (tokens.css e estatico),
  // sem sentido recalcular a cada troca de carregando/erro (code-review).
  const appearance = useMemo(() => appearanceClerk(), []);

  return (
    <main className="pf-page">
      <div className={styles.topo}>
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
        {/* issue #51: avatar (Manage account -> Perfil do Pulse FX, nao modal da Clerk)
            ou link Entrar, dependendo da sessao. */}
        <SignedIn>
          <UserButton
            appearance={appearance}
            userProfileMode="navigation"
            userProfileUrl="#perfil"
          />
        </SignedIn>
        <SignedOut>
          <a href="#login" className={styles.entrar}>
            Entrar
          </a>
        </SignedOut>
      </div>
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
            <IndicadorCard item={item} favoritado={favoritosIds.has(item.indicadorId)} />
          </a>
        ))}
      </div>
    </main>
  );
}
