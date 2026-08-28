// FR-004/US2: fonte, defasagem, revisao e ausencia de interpolacao - conteudo vem pronto
// da API (domain/indicador/limitacoes.ts), nunca reescrito/recalculado no frontend.
export function TextoLimitacoes({ texto }: { texto: string }) {
  return (
    <section aria-label="Limitações dos dados">
      <h2>Limitações dos dados</h2>
      <p>{texto}</p>
    </section>
  );
}
