import { useEffect, useState } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Dashboard } from "./pages/Dashboard.js";
import { DetalheSerie } from "./pages/DetalheSerie.js";
import { Login } from "./pages/Login.js";

const ROTA_MEUS_INDICADORES = "meus-indicadores";
const ROTA_LOGIN = "login";

function lerHashDaUrl(): string | null {
  return window.location.hash.replace(/^#\/?/, "") || null;
}

// Roteamento minimo via hash nativo do browser (sem lib nova, ver ADR de plan.md) -
// Dashboard <-> Detalhe <-> Login/Meus indicadores.
export function App() {
  const [hash, setHash] = useState<string | null>(lerHashDaUrl);

  useEffect(() => {
    const aoMudarHash = () => setHash(lerHashDaUrl());
    window.addEventListener("hashchange", aoMudarHash);
    return () => window.removeEventListener("hashchange", aoMudarHash);
  }, []);

  if (hash === ROTA_LOGIN) {
    return <Login />;
  }

  if (hash === ROTA_MEUS_INDICADORES) {
    return (
      <>
        <SignedIn>
          {/* Pagina MeusIndicadores.tsx substitui este placeholder em US2 (T019) -
              guarda de rota (FR-004) ja funcional antes da pagina existir. */}
          <p>Carregando "Meus indicadores"...</p>
        </SignedIn>
        <SignedOut>
          <Login />
        </SignedOut>
      </>
    );
  }

  return hash ? <DetalheSerie indicadorId={hash} /> : <Dashboard />;
}
