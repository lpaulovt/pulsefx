# Tasks: Dashboard

**Input**: Design documents from `specs/001-dashboard/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/get-indicadores.md](contracts/get-indicadores.md)

**Tests**: incluídas — cobre domínio (regra de variação) e HTTP no backend, componente/hook no
frontend (readme.md seção 7).

**Depends on**: `specs/004-sincronizacao` (T004 já cria `Indicador`/`Observacao` — este módulo
reaproveita, não recria).

## Phase 1: Setup

- [x] T001 Confirmar seed do conjunto fechado de indicadores (USD/BRL PTAX, Meta Selic, IPCA,
      FEDFUNDS) na migration criada em `specs/004-sincronizacao` (T003) — se ainda não populada,
      adicionar `INSERT` na migration em `apps/api/migrations/`
      (já coberto: `apps/api/migrations/1787948249583_create-sincronizacao-tables.cjs` já
      insere os 4 indicadores; nenhuma migration nova necessária)

---

## Phase 2: Foundational

- [x] T002 Implementar `VariacaoService` (união discriminada `calculada | indisponivel`) em
      `apps/api/src/domain/indicador/variacao-service.ts`
- [x] T003 [P] Implementar `IndicadorRepository` (leitura de `indicador` + últimas 2 observações
      por indicador) em `apps/api/src/infrastructure/persistence/postgres/indicador-repository.ts`
- [x] T004 [P] Definir DTO `DashboardItem` compartilhado em
      `packages/shared-types/src/dashboard.ts` (contrato HTTP entre API e web)

**Checkpoint**: `VariacaoService` e repositório prontos — reaproveitados por US1 e por
`specs/002-detalhe-serie`.

---

## Phase 3: User Story 1 - Ver estado atual de todos indicadores acompanhados (Priority: P1) 🎯 MVP

**Goal**: `GET /indicadores` retorna os 4 indicadores com valor/data/variação; frontend renderiza
um card por indicador.

**Independent Test**: com dado seedado, `curl /indicadores` retorna os 4; abrir `/` no browser
mostra 4 cards.

### Tests for User Story 1

- [x] T005 [P] [US1] Teste de domínio: `VariacaoService` (fx-diária D-1, macro-mensal N=1 mês,
      Selic em p.p.) em `apps/api/tests/domain/variacao-service.test.ts`
- [x] T006 [P] [US1] Teste HTTP: contrato de `GET /indicadores` (schema da resposta) em
      `apps/api/tests/http/indicadores.routes.test.ts`
- [x] T007 [P] [US1] Teste de frontend: hook `useDashboard` renderiza 4 cards a partir de resposta
      mockada, em `apps/web/tests/frontend/use-dashboard.test.tsx`

### Implementation for User Story 1

- [x] T008 [US1] Implementar caso de uso `ObterDashboard` em
      `apps/api/src/application/indicador/obter-dashboard.ts` (usa T002, T003)
- [x] T009 [US1] Implementar rota `GET /indicadores` em
      `apps/api/src/interface/http/routes/indicadores.routes.ts`
- [x] T010 [US1] Registrar rota em `apps/api/src/interface/http/server.ts`
- [x] T011 [P] [US1] Implementar `useDashboard` (fetch + estado) em `apps/web/src/hooks/use-dashboard.ts`
- [x] T012 [P] [US1] Implementar `IndicadorCard` (nome, valor, data, variação, badge diária/mensal)
      em `apps/web/src/components/IndicadorCard.tsx`
- [x] T013 [US1] Implementar página `Dashboard` em `apps/web/src/pages/Dashboard.tsx` (usa T011, T012)

**Checkpoint**: Dashboard funcional e testável de ponta a ponta.

---

## Phase 4: User Story 2 - Entender quando não há variação calculável (Priority: P2)

**Goal**: card mostra estado explícito quando não há observação anterior suficiente.

**Independent Test**: seed de indicador com 1 observação só → card mostra "sem variação ainda",
nunca 0%.

### Tests for User Story 2

- [ ] T014 [P] [US2] Teste de domínio: `VariacaoService` retorna `indisponivel` com 0 ou 1
      observação, em `apps/api/tests/domain/variacao-service.test.ts` (estende T005)

### Implementation for User Story 2

- [ ] T015 [US2] Tratar `variacao.tipo === "indisponivel"` no `IndicadorCard` (T012) — mensagem
      explícita, nunca "0%" nem traço silencioso

**Checkpoint**: guardrail de "nunca fabricar variação" coberto por teste e UI.

---

## Phase 5: User Story 3 - Ver disclaimer sem precisar procurar (Priority: P3)

**Goal**: disclaimer educacional visível na renderização inicial do Dashboard.

**Independent Test**: renderizar `Dashboard` sem interação e verificar disclaimer no DOM.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Implementar componente `Disclaimer` (texto fixo, sempre visível, sem
      tooltip/modal) em `apps/web/src/components/Disclaimer.tsx`
- [ ] T017 [US3] Incluir `Disclaimer` em `Dashboard.tsx` (T013), acima ou junto aos cards

**Checkpoint**: todas as user stories da feature funcionais.

---

## Phase 6: Polish

- [ ] T018 Rodar `quickstart.md` manualmente e confirmar consistência com
      `specs/002-detalhe-serie` (mesma variação, mesmo indicador/data)

---

## Dependencies & Execution Order

- Setup (T001) → Foundational (T002-T004) → US1 (T005-T013) → US2 (T014-T015) → US3 (T016-T017) → Polish
- US2 estende o mesmo `VariacaoService`/`IndicadorCard` de US1 — implementar em sequência.
- US3 é independente de US1/US2 (só adiciona componente) — pode rodar em paralelo com US2.

## Parallel Example: User Story 1

```bash
Task: "Teste de domínio VariacaoService em apps/api/tests/domain/variacao-service.test.ts"
Task: "Teste HTTP GET /indicadores em apps/api/tests/http/indicadores.routes.test.ts"
Task: "Teste de frontend useDashboard em apps/web/tests/frontend/use-dashboard.test.tsx"
```

## Implementation Strategy

MVP = Setup + Foundational + US1. US2 (guardrail de variação indisponível) é fortemente
recomendado antes de considerar o MVP "pronto" — é critério de aceite macro explícito da vision,
não apenas um nice-to-have. US3 é rápido e de baixo risco, pode entrar junto.
