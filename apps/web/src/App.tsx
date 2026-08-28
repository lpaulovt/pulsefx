import { useEffect, useState } from "react";
import { Dashboard } from "./pages/Dashboard.js";
import { DetalheSerie } from "./pages/DetalheSerie.js";

function lerIndicadorIdDaUrl(): string | null {
  return window.location.hash.replace(/^#\/?/, "") || null;
}

// Roteamento minimo via hash nativo do browser (sem lib nova, ver ADR de plan.md) -
// Dashboard <-> Detalhe. Favoritos (spec 003) reaproveita o mesmo mecanismo.
export function App() {
  const [indicadorId, setIndicadorId] = useState<string | null>(lerIndicadorIdDaUrl);

  useEffect(() => {
    const aoMudarHash = () => setIndicadorId(lerIndicadorIdDaUrl());
    window.addEventListener("hashchange", aoMudarHash);
    return () => window.removeEventListener("hashchange", aoMudarHash);
  }, []);

  return indicadorId ? <DetalheSerie indicadorId={indicadorId} /> : <Dashboard />;
}
