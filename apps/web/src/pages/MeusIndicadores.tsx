import { useFavoritos } from "../hooks/use-favoritos.js";
import { IndicadorCard } from "../components/IndicadorCard.js";

export function MeusIndicadores() {
  const { indicadores, carregando, erro } = useFavoritos();

  return (
    <main>
      <h1>Meus indicadores</h1>
      {carregando && <p>Carregando favoritos...</p>}
      {erro && <p role="alert">{erro}</p>}
      {!carregando && !erro && indicadores.length === 0 && (
        // FR-006 (US3): estado vazio explicito, nunca tela em branco.
        <p>
          Você ainda não marcou nenhum indicador como favorito. Vá ao{" "}
          <a href="#">Dashboard</a> e escolha os indicadores que quer acompanhar aqui.
        </p>
      )}
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
