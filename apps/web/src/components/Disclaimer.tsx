import styles from "./Disclaimer.module.css";

// Aviso educacional (FR-008, readme.md secao 4.5) - texto fixo, sempre visivel na
// renderizacao inicial, nunca atras de tooltip/modal/scroll. Estilo (issue #47): alto
// contraste de proposito - nunca reduzir tamanho/contraste desse aviso por estetica.
export function Disclaimer() {
  return (
    <p role="note" className={styles.disclaimer}>
      <svg
        className={styles.icon}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
      Os dados exibidos têm finalidade educacional e informativa. Isto não é recomendação de
      investimento.
    </p>
  );
}
