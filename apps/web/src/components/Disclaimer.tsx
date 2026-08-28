// Aviso educacional (FR-008, readme.md secao 4.5) - texto fixo, sempre visivel na
// renderizacao inicial, nunca atras de tooltip/modal/scroll.
export function Disclaimer() {
  return (
    <p role="note">
      Os dados exibidos têm finalidade educacional e informativa. Isto não é recomendação de
      investimento.
    </p>
  );
}
