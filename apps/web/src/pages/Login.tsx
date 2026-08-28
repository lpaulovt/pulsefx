import { SignIn, SignUp } from "@clerk/clerk-react";

// Unico ponto de autenticacao do MVP (FR-004a) - SignIn/SignUp do Clerk cobrem
// login e criacao de conta na mesma tela, sem formulario custom.
// routing="virtual": o app ja usa window.location.hash como router proprio
// (App.tsx) - "hash"/"path" do Clerk tomariam o hash da URL para os proprios
// passos (verificacao, etc.) e colidiriam com esse roteamento.
export function Login() {
  return (
    <main>
      <p>
        <a href="#">&larr; Voltar ao Dashboard</a>
      </p>
      <h1>Entrar para ver "Meus indicadores"</h1>
      <SignIn routing="virtual" />
      <SignUp routing="virtual" />
    </main>
  );
}
