import { SignIn, SignUp } from "@clerk/clerk-react";
import styles from "./Login.module.css";

// Unico ponto de autenticacao do MVP (FR-004a) - SignIn/SignUp do Clerk cobrem
// login e criacao de conta na mesma tela, sem formulario custom.
// routing="virtual": o app ja usa window.location.hash como router proprio
// (App.tsx) - "hash"/"path" do Clerk tomariam o hash da URL para os proprios
// passos (verificacao, etc.) e colidiriam com esse roteamento.
export function Login() {
  return (
    <main className={styles.page}>
      <p>
        <a href="#" className="pf-voltar">
          &larr; Voltar ao Dashboard
        </a>
      </p>
      <h1 className={styles.titulo}>Entrar para ver "Meus indicadores"</h1>
      <div className={styles.widgets}>
        <SignIn routing="virtual" />
        <SignUp routing="virtual" />
      </div>
    </main>
  );
}
