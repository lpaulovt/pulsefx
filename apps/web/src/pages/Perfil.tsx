import { useUser } from "@clerk/clerk-react";
import styles from "./Perfil.module.css";

// Dado de conta vem direto de useUser() (FR-002/FR-007) - sem hook novo, sem
// chamada ao backend do Pulse FX (ver ADR de plan.md: useUser() ja e' global
// via ClerkProvider, nao ha logica a esconder atras de um hook proprio).
export function Perfil() {
  const { user } = useUser();

  return (
    <main className="pf-page">
      <h1>Perfil</h1>
      {user && (
        <dl className={styles.dados}>
          {user.fullName && (
            <div>
              <dt>Nome</dt>
              <dd>{user.fullName}</dd>
            </div>
          )}
          {user.primaryEmailAddress && (
            <div>
              <dt>E-mail</dt>
              <dd>{user.primaryEmailAddress.emailAddress}</dd>
            </div>
          )}
          {user.createdAt && (
            <div>
              <dt>Conta criada em</dt>
              <dd>{user.createdAt.toLocaleDateString("pt-BR")}</dd>
            </div>
          )}
        </dl>
      )}
      <p>
        <a href="#meus-indicadores">Meus indicadores</a>
      </p>
    </main>
  );
}
