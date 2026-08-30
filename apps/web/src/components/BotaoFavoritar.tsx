import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { desmarcarFavorito, marcarFavorito } from "../services/api-client.js";
import styles from "./BotaoFavoritar.module.css";

export interface BotaoFavoritarProps {
  indicadorId: string;
  /** Estado inicial - fonte de verdade real e o backend (GET /favoritos, US2). */
  favoritadoInicial?: boolean;
}

// FR-001/FR-002: marcar/desmarcar com efeito imediato (estado otimista). FR-004: exige
// sessao Clerk - sem login, direciona para a tela de Login em vez de chamar a API.
export function BotaoFavoritar({ indicadorId, favoritadoInicial = false }: BotaoFavoritarProps) {
  const { isSignedIn, getToken } = useAuth();
  const [favoritado, setFavoritado] = useState(favoritadoInicial);
  const [carregando, setCarregando] = useState(false);

  // No Dashboard, GET /indicadores (publico) e GET /favoritos (autenticado) sao dois
  // fetches independentes - nao ha garantia de qual responde primeiro. Se o card monta
  // antes de favoritos carregar, "favoritadoInicial" nasce false e o useState so captura
  // esse valor na montagem (React ignora o argumento inicial em renders seguintes) - sem
  // este efeito, o card nunca reflete o favorito real quando favoritos chega depois.
  useEffect(() => {
    setFavoritado(favoritadoInicial);
  }, [favoritadoInicial]);

  async function alternar(event: React.MouseEvent): Promise<void> {
    // IndicadorCard costuma estar dentro de um <a> (navegacao ao Detalhe) - o clique no
    // botao nao pode disparar essa navegacao.
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      window.location.hash = "#login";
      return;
    }

    const proximoEstado = !favoritado;
    setFavoritado(proximoEstado);
    setCarregando(true);
    try {
      const token = await getToken();
      if (proximoEstado) {
        await marcarFavorito(indicadorId, token);
      } else {
        await desmarcarFavorito(indicadorId, token);
      }
    } catch {
      setFavoritado(!proximoEstado); // reverte o otimismo em falha (FR-003 e sobre backend, nao UI)
    } finally {
      setCarregando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={carregando}
      aria-pressed={favoritado}
      className={`${styles.botao} ${favoritado ? styles.favoritado : ""}`}
    >
      {favoritado ? "★ Favorito" : "☆ Favoritar"}
    </button>
  );
}
