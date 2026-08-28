import { useFavoritos } from "../hooks/use-favoritos.js";
import { IndicadorCard } from "../components/IndicadorCard.js";

export function MeusIndicadores() {
  const { indicadores, carregando, erro } = useFavoritos();

  return (
    <main>
      <h1>Meus indicadores</h1>
      {carregando && <p>Carregando favoritos...</p>}
      {erro && <p role="alert">{erro}</p>}
      <div>
        {indicadores.map((item) => (
          <a key={item.indicadorId} href={`#${item.indicadorId}`}>
            <IndicadorCard item={item} favoritado />
          </a>
        ))}
      </div>
    </main>
  );
}
