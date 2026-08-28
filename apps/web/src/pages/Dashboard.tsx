import { useDashboard } from "../hooks/use-dashboard.js";
import { IndicadorCard } from "../components/IndicadorCard.js";
import { Disclaimer } from "../components/Disclaimer.js";

export function Dashboard() {
  const { indicadores, carregando, erro } = useDashboard();

  return (
    <main>
      <h1>Pulse FX</h1>
      <Disclaimer />
      {carregando && <p>Carregando indicadores...</p>}
      {erro && <p role="alert">{erro}</p>}
      <div>
        {indicadores.map((item) => (
          <IndicadorCard key={item.indicadorId} item={item} />
        ))}
      </div>
    </main>
  );
}
