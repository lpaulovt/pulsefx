# Tasks: Sincronização

**Input**: Design documents from `specs/004-sincronizacao/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/admin-sync.md](contracts/admin-sync.md)

**Tests**: incluídas — readme.md seção 7 exige mínimo de testes reais distribuídos entre domínio,
persistência, HTTP e integração; este módulo cobre domínio + persistência + HTTP + integração.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Adicionar `node-cron` às dependências de `apps/api/package.json`
- [x] T002 Adicionar `ADMIN_SYNC_KEY` a `.env.example` e a `env` em `apps/api/src/infrastructure/config/env.ts`
- [x] T003 [P] Criar migration `node-pg-migrate` para tabelas `indicador`, `observacao`, `job_execucao` em `apps/api/migrations/`

---

## Phase 2: Foundational (bloqueia as user stories)

- [x] T004 Criar tipos de domínio `Indicador`, `TipoSerie`, `Observacao` em `apps/api/src/domain/indicador/` (compartilhado com specs/001-dashboard)
- [x] T005 Criar interface `ObservacaoRepository` (porta) em `apps/api/src/domain/sincronizacao/observacao-repository.ts`
- [x] T006 [P] Implementar `PostgresObservacaoRepository` (upsert por `(indicador_id, data_referencia)`) em `apps/api/src/infrastructure/persistence/postgres/observacao-repository.ts`
- [x] T007 [P] Implementar `BcbClient` (PTAX, Selic, IPCA) em `apps/api/src/infrastructure/http-clients/bcb-client.ts`
- [x] T008 [P] Implementar `FredClient` (FEDFUNDS) em `apps/api/src/infrastructure/http-clients/fred-client.ts`
- [x] T009 Criar middleware de autenticação do endpoint admin (`X-Admin-Key`) em `apps/api/src/interface/http/plugins/admin-auth.ts`

**Checkpoint**: fundação pronta — user stories podem começar.

---

## Phase 3: User Story 1 - Dado atualizado sem depender de tráfego de usuário (Priority: P1) 🎯 MVP

**Goal**: job agendado sincroniza os 4 indicadores sem depender de acesso de usuário final.

**Independent Test**: rodar o job manualmente (via chamada direta ao caso de uso, sem HTTP) contra
Postgres de teste e verificar que `Observacao` foi persistida para os 4 indicadores.

### Tests for User Story 1

- [x] T010 [P] [US1] Teste de domínio: normalização de payload BCB/FRED → `Observacao`, em `apps/api/tests/domain/sincronizacao.test.ts`
- [x] T011 [P] [US1] Teste de persistência: upsert idempotente `(indicador_id, data_referencia)`, em `apps/api/tests/persistence/observacao-repository.test.ts`
- [x] T012 [P] [US1] Teste de integração: caso de uso completo (client fake → domínio → repositório) contra Postgres de teste, em `apps/api/tests/integration/sincronizacao.test.ts`

### Implementation for User Story 1

- [x] T013 [US1] Implementar caso de uso `SincronizarIndicador` (application) em `apps/api/src/application/sincronizacao/sincronizar-indicador.ts` (depende de T004-T008)
- [x] T014 [US1] Registrar jobs `node-cron` (fx-diária 1x/dia útil, macro-mensal 1x/dia) em `apps/api/src/infrastructure/scheduler/sync-scheduler.ts`
- [x] T015 [US1] Inicializar scheduler em `apps/api/src/main.ts`
- [x] T016 [US1] Registrar execução em `JobExecucao` (sucesso/falha) dentro do caso de uso (T013)

**Checkpoint**: sincronização agendada funcional e testável de ponta a ponta.

---

## Phase 4: User Story 2 - Forçar sincronização fora do ciclo (Priority: P2)

**Goal**: endpoint admin protegido dispara sincronização sob demanda.

**Independent Test**: `curl -X POST /admin/sync` com/sem `X-Admin-Key` correto.

### Tests for User Story 2

- [x] T017 [P] [US2] Teste HTTP: 401 sem `X-Admin-Key`, 202 com chave correta, em `apps/api/tests/http/admin-sync.test.ts`

### Implementation for User Story 2

- [x] T018 [US2] Implementar rota `POST /admin/sync` em `apps/api/src/interface/http/routes/admin-sync.routes.ts` (usa T009, T013)
- [x] T019 [US2] Registrar rota em `apps/api/src/interface/http/server.ts`

**Checkpoint**: contingência manual funcional, sem substituir o job agendado.

---

## Phase 5: User Story 3 - Fonte externa indisponível não quebra o produto (Priority: P1)

**Goal**: falha de BCB/FRED durante sync não derruba Dashboard/Detalhe.

**Independent Test**: forçar client a lançar erro (mock) e verificar que último dado válido
permanece servido e `JobExecucao` registra a falha.

### Tests for User Story 3

- [ ] T020 [P] [US3] Teste de integração: falha simulada do client externo mantém último dado válido, em `apps/api/tests/integration/sincronizacao-falha.test.ts`

### Implementation for User Story 3

- [ ] T021 [US3] Adicionar tratamento de erro + 1 retry com backoff curto no caso de uso `SincronizarIndicador` (T013), nunca propagando exceção não tratada para o scheduler/rota

**Checkpoint**: todas as user stories da feature funcionais e testadas independentemente.

---

## Phase 6: Polish

- [ ] T022 Documentar política de sincronização (frequência, mecanismo, proteção do endpoint) no `readme.md` raiz (seção exigida pelo readme seção 6)
- [ ] T023 Rodar `quickstart.md` manualmente e confirmar os 3 cenários de validação

---

## Dependencies & Execution Order

- Setup (T001-T003) → Foundational (T004-T009) → US1 (T010-T016) → US2 (T017-T019) → US3 (T020-T021) → Polish
- US2 depende de US1 (T013) já existir; US3 modifica o caso de uso de US1 (T013) — implementar em sequência, não em paralelo com US1.

## Parallel Example: Foundational

```bash
Task: "Implementar PostgresObservacaoRepository em apps/api/src/infrastructure/persistence/postgres/observacao-repository.ts"
Task: "Implementar BcbClient em apps/api/src/infrastructure/http-clients/bcb-client.ts"
Task: "Implementar FredClient em apps/api/src/infrastructure/http-clients/fred-client.ts"
```

## Implementation Strategy

MVP = Setup + Foundational + US1 (job agendado funcionando e testado). US2/US3 são incrementais e
não bloqueiam a demonstração do MVP central.
