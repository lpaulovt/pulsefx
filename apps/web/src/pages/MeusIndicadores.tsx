import { useState } from "react";
import { useFavoritos } from "../hooks/use-favoritos.js";
import { IndicadorCard } from "../components/IndicadorCard.js";
import styles from "./MeusIndicadores.module.css";

export function MeusIndicadores() {
  const { indicadores, carregando, erro } = useFavoritos();
  // useFavoritos() so busca uma vez (nao reflete desfavoritar feito nesta propria tela) -
  // remocao otimista local: esta tela so faz sentido mostrar favoritos, entao desfavoritar
  // precisa sumir o card na hora, nao so trocar a estrela e esperar reload.
  const [removidos, setRemovidos] = useState<Set<string>>(new Set());
  const visiveis = indicadores.filter((item) => !removidos.has(item.indicadorId));

  function aoAlterarFavorito(indicadorId: string, favoritado: boolean): void {
    // favoritado=false -> some da lista; favoritado=true so acontece de volta se o proprio
    // BotaoFavoritar reverteu por falha na API (aqui e' sempre desmarcar, nunca marcar).
    setRemovidos((atual) => {
      const proximo = new Set(atual);
      if (favoritado) proximo.delete(indicadorId);
      else proximo.add(indicadorId);
      return proximo;
    });
  }

  return (
    <main className="pf-page">
      <p>
        <a href="#" className="pf-voltar">
          &larr; Voltar ao Dashboard
        </a>
      </p>
      <h1>Meus indicadores</h1>
      <p>
        <a href="#perfil">Ver perfil</a>
      </p>
      {carregando && <p className="pf-state">Carregando favoritos...</p>}
      {erro && (
        <p role="alert" className="pf-erro">
          {erro}
        </p>
      )}
      {!carregando && !erro && visiveis.length === 0 && (
        // FR-006 (US3): estado vazio explicito, nunca tela em branco. Tambem cobre o caso
        // de desfavoritar o ultimo item nesta propria tela (remocao otimista acima).
        <p className={styles.vazio}>
          Você ainda não marcou nenhum indicador como favorito. Vá ao{" "}
          <a href="#">Dashboard</a> e escolha os indicadores que quer acompanhar aqui.
        </p>
      )}
      <div className="pf-grid">
        {visiveis.map((item) => (
          <a key={item.indicadorId} href={`#${item.indicadorId}`} className="pf-card-link">
            <IndicadorCard
              item={item}
              favoritado
              onFavoritoAlterado={(favoritado) => aoAlterarFavorito(item.indicadorId, favoritado)}
            />
          </a>
        ))}
      </div>
    </main>
  );
}
