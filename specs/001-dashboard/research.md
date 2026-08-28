# Research: Dashboard

Stack transversal (Fastify, node-pg-migrate, Vitest, npm workspaces, React 19 + Vite) já fixada
pelo scaffold existente. Decisões de agendamento/proteção admin ficam em
[specs/004-sincronizacao/research.md](../004-sincronizacao/research.md).

## Cálculo de variação percentual

- **Decision**: calculado na camada Application (caso de uso "obter dashboard"), não no banco (sem
  window function/view materializada) e não no frontend.
- **Rationale**: regra de variação (FR-005) é a peça mais sensível do domínio segundo o
  `fullstack-architect` — precisa ser testável sem mock de rede nem banco. Calcular em SQL
  (window function) funcionaria, mas dificultaria testar a regra isoladamente com Vitest puro;
  calcular no frontend duplicaria a regra entre Dashboard/Detalhe (viola FR-006/consistência).
  Um serviço de domínio único, chamado pelos dois casos de uso (dashboard e detalhe), garante a
  mesma regra nos dois lugares por construção, não por convenção.
- **Alternatives considered**: view SQL com `LAG()` — mais rápido de consultar, mas move regra de
  negócio pra fora do domínio testável em TypeScript; recalcular no frontend — duplica lógica e
  arrisca divergência entre Dashboard/Detalhe (o próprio risco que a vision aponta).

## Estado "sem variação calculável"

- **Decision**: serviço de domínio retorna união discriminada
  `{ tipo: "calculada", valor, unidade } | { tipo: "indisponivel", motivo }` em vez de `number | null`.
- **Rationale**: `null` seria ambíguo (dado ausente? zero real? erro?) — a união discriminada força
  quem consome (API/frontend) a tratar o caso explicitamente, evitando o bug que a vision
  identifica como guardrail crítico ("nunca fabricar variação").
- **Alternatives considered**: `number | null` com convenção de comentário — frágil, depende de
  disciplina de quem lê o código, não do compilador.
