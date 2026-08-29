import { useMemo, useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { appearanceClerk } from "../lib/clerk-appearance.js";
import styles from "./Login.module.css";

// Unico ponto de autenticacao do MVP (FR-004a) - SignIn/SignUp do Clerk cobrem
// login e criacao de conta na mesma tela, sem formulario custom.
// routing="virtual": o app ja usa window.location.hash como router proprio
// (App.tsx) - "hash"/"path" do Clerk tomariam o hash da URL para os proprios
// passos (verificacao, etc.) e colidiriam com esse roteamento.
// Um formulario por vez (issue #51) - alternancia via estado local, sem rota nova.
export function Login() {
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const appearance = useMemo(() => appearanceClerk(), []);

  return (
    <main className={styles.page}>
      <p>
        <a href="#" className="pf-voltar">
          &larr; Voltar ao Dashboard
        </a>
      </p>
      <h1 className={styles.titulo}>Entrar para ver "Meus indicadores"</h1>
      <div className={styles.widgets}>
        {modo === "entrar" ? (
          <SignIn routing="virtual" appearance={appearance} />
        ) : (
          <SignUp routing="virtual" appearance={appearance} />
        )}
      </div>
      <p>
        {modo === "entrar" ? (
          <button type="button" className={styles.alternar} onClick={() => setModo("cadastrar")}>
            Não tem conta? Cadastre-se
          </button>
        ) : (
          <button type="button" className={styles.alternar} onClick={() => setModo("entrar")}>
            Já tem conta? Entrar
          </button>
        )}
      </p>
    </main>
  );
}
