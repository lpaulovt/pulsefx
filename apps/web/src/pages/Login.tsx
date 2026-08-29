import { SignIn, SignUp } from "@clerk/clerk-react";
import styles from "./Login.module.css";

// appearance (FR-001/T002): tokens do design system (issue #47). borderRadius/
// fontFamily aceitam var() cru (Clerk so os repassa como CSS puro). Cores, porem,
// passam por parser interno de cor (hex/rgb/hsl) para derivar hover/foco/contraste -
// "var(--x)" cru nao casa com esse parser e o botao primario fica transparente
// (confirmado em browser real). Por isso resolvemos a cor para valor literal via
// getComputedStyle, chamado em render (depois que tokens.css ja foi aplicado).
function corResolvida(variavelCss: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variavelCss).trim();
}

// Unico ponto de autenticacao do MVP (FR-004a) - SignIn/SignUp do Clerk cobrem
// login e criacao de conta na mesma tela, sem formulario custom.
// routing="virtual": o app ja usa window.location.hash como router proprio
// (App.tsx) - "hash"/"path" do Clerk tomariam o hash da URL para os proprios
// passos (verificacao, etc.) e colidiriam com esse roteamento.
export function Login() {
  const appearance = {
    variables: {
      colorPrimary: corResolvida("--accent"),
      colorBackground: corResolvida("--surface"),
      colorText: corResolvida("--ink"),
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-body)",
    },
  };

  return (
    <main className={styles.page}>
      <p>
        <a href="#" className="pf-voltar">
          &larr; Voltar ao Dashboard
        </a>
      </p>
      <h1 className={styles.titulo}>Entrar para ver "Meus indicadores"</h1>
      <div className={styles.widgets}>
        <SignIn routing="virtual" appearance={appearance} />
        <SignUp routing="virtual" appearance={appearance} />
      </div>
    </main>
  );
}
