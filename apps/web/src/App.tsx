import { useEffect, useState, type ReactNode } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Dashboard } from "./pages/Dashboard.js";
import { DetalheSerie } from "./pages/DetalheSerie.js";
import { Login } from "./pages/Login.js";
import { MeusIndicadores } from "./pages/MeusIndicadores.js";
import { Perfil } from "./pages/Perfil.js";

const ROTA_MEUS_INDICADORES = "meus-indicadores";
const ROTA_PERFIL = "perfil";
const ROTA_LOGIN = "login";

function lerHashDaUrl(): string | null {
  return window.location.hash.replace(/^#\/?/, "") || null;
}

// Guarda de rota compartilhada (FR-004/FR-004a) - qualquer rota autenticada usa o
// mesmo par SignedIn/SignedOut, redirecionando para Login sem sessao.
function rotaProtegida(pagina: ReactNode) {
  return (
    <>
      <SignedIn>{pagina}</SignedIn>
      <SignedOut>
        <Login />
      </SignedOut>
    </>
  );
}

// Roteamento minimo via hash nativo do browser (sem lib nova, ver ADR de plan.md) -
// Dashboard <-> Detalhe <-> Login/Meus indicadores/Perfil.
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
    return rotaProtegida(<MeusIndicadores />);
  }

  if (hash === ROTA_PERFIL) {
    return rotaProtegida(<Perfil />);
  }

  return hash ? <DetalheSerie indicadorId={hash} /> : <Dashboard />;
}
