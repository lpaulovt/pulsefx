# Research: Sincronização

Decisões técnicas específicas deste módulo. Stack transversal (Fastify, node-pg-migrate, Vitest,
npm workspaces) já fixada pelo scaffold existente (`apps/api/package.json`) — não redecidida aqui.

## Mecanismo de agendamento do job

- **Decision**: `node-cron` (dependência leve, cron syntax, sem infra externa).
- **Rationale**: MVP precisa de "1x/dia útil" (fx-diária) e "1x/dia" (macro-mensal) — cron syntax
  expressa isso diretamente (`0 18 * * 1-5` etc.), sem exigir fila/worker separado. Zero infra
  nova (sem Redis) — proporcional ao volume real (4 séries, poucas chamadas/dia).
- **Alternatives considered**:
  - BullMQ/queue com Redis: overkill — introduz dependência de infra (Redis) que o MVP não pede em
    lugar nenhum do readme, só se justificaria com volume/concorrência que este projeto não tem.
  - `setInterval` cru no processo: funciona, mas reimplementa parte do que cron syntax já resolve
    (ex.: "só em dia útil") com lógica manual a mais — não vale a economia de uma dependência tão
    pequena.

## Proteção do endpoint admin de sincronização forçada

- **Decision**: header `X-Admin-Key` comparado a `ADMIN_SYNC_KEY` (env var), 401 se ausente/errado.
- **Rationale**: MVP não tem sistema de contas fora de favoritos (que usa Clerk só para aquela
  feature) — reaproveitar Clerk aqui criaria acoplamento desnecessário entre módulos não
  relacionados. Chave simples via header é proporcional ao requisito de produto ("protegido, não
  público"), documentável em 2 linhas no README.
- **Alternatives considered**:
  - JWT/OAuth completo: exigiria emissor de token, mais peça móvel do que o requisito pede.
  - IP allowlist: frágil em ambiente de demonstração/Docker local, não confiável em produção real
    sem mais infraestrutura de rede.

## Rate limit BCB/FRED

- **Decision**: sem retry agressivo — 1 tentativa + 1 retry com backoff fixo curto (ex.: 5s) por
  chamada de sincronização; falha após isso mantém último dado válido (FR-006) e loga erro.
- **Rationale**: vision (`sincronizacao-vision.md` §6) já assume cenário conservador por rate limit
  não confirmado (Olinda retornou HTTP 403 na tentativa de leitura automatizada da doc). Volume de
  chamadas é baixíssimo (4 séries, poucas vezes ao dia) — qualquer rate limit público razoável
  comporta isso com folga; não há necessidade de backoff exponencial sofisticado.
- **Alternatives considered**: backoff exponencial com múltiplas tentativas — complexidade extra
  sem benefício mensurável nesse volume; retry ilimitado — arrisca mascarar indisponibilidade real
  da fonte (viola FR-006 ao atrasar a decisão de "manter último dado válido").

## Idempotência do job

- **Decision**: chave de unicidade `(indicador_id, data_referencia)` na tabela de observações —
  upsert (insert ... on conflict do update) em vez de insert simples.
- **Rationale**: reprocessar a mesma janela (ex.: rodar o job manualmente duas vezes no mesmo dia)
  não deve duplicar observação — requisito explícito do `fullstack-architect` (idempotência do
  job/endpoint de sincronização).
- **Alternatives considered**: verificar existência antes de inserir (select + insert condicional)
  — mais round-trips e sujeito a race condition; upsert é atômico no Postgres.
