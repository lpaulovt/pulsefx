# Tasks: Detalhe de série

**Input**: Design documents from `specs/002-detalhe-serie/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/get-serie.md](contracts/get-serie.md)

**Depends on**: `specs/001-dashboard` (T002 `VariacaoService`, T003 `IndicadorRepository`, T004
`Indicador`/`Observacao`) — este módulo estende, não recria.

## Phase 1: Setup

- [ ] T001 Nenhuma tarefa de setup nova — reaproveita migrations e seed de `specs/001-dashboard`.

---

## Phase 2: Foundational

- [x] T002 Adicionar método de janela (`buscarSerie(indicadorId, limit)`) ao
      `IndicadorRepository` existente em
      `apps/api/src/infrastructure/persistence/postgres/indicador-repository.ts`
- [x] T003 [P] Criar constante `limitacoes.ts` (texto por `tipoSerie`/`fonte`) em
      `apps/api/src/domain/indicador/limitacoes.ts`
- [x] T004 [P] Definir DTO `SerieResponse`/`SerieItem` em `packages/shared-types/src/serie.ts`

**Checkpoint**: extensão da fundação do Dashboard pronta.

---

## Phase 3: User Story 1 - Ver histórico de um indicador (Priority: P1) 🎯 MVP

**Goal**: `GET /indicadores/:id/serie` retorna janela padrão por tipo de série; frontend renderiza
tabela.

**Independent Test**: com 30+ observações diárias seedadas, `curl` retorna até 30 pontos
ordenados cronologicamente.

### Tests for User Story 1

- [x] T005 [P] [US1] Teste de domínio: janela 30 (fx-diária) / 12 (macro-mensal) via
      `buscarSerie`, em `apps/api/tests/domain/janela-historico.test.ts`
- [x] T006 [P] [US1] Teste HTTP: contrato de `GET /indicadores/:id/serie` (200 e 404) em
      `apps/api/tests/http/serie.routes.test.ts`

### Implementation for User Story 1

- [x] T007 [US1] Implementar caso de uso `ObterSerie` em
      `apps/api/src/application/indicador/obter-serie.ts` (usa T002, `VariacaoService` de
      specs/001-dashboard)
- [x] T008 [US1] Implementar rota `GET /indicadores/:id/serie` em
      `apps/api/src/interface/http/routes/serie.routes.ts`
- [x] T009 [US1] Registrar rota em `apps/api/src/interface/http/server.ts`
- [x] T010 [P] [US1] Implementar `useSerie` (fetch por indicador) em `apps/web/src/hooks/use-serie.ts`
- [x] T011 [P] [US1] Implementar `SerieTabela` (data de referência + valor + variação por linha)
      em `apps/web/src/components/SerieTabela.tsx`
- [x] T012 [US1] Implementar página `DetalheSerie` em `apps/web/src/pages/DetalheSerie.tsx` (usa
      T010, T011)

**Checkpoint**: Detalhe funcional, consistente com Dashboard.

---

## Phase 4: User Story 2 - Entender limitações do dado (Priority: P1)

**Goal**: texto de limitações sempre visível na tela.

**Independent Test**: abrir Detalhe de qualquer indicador e verificar texto presente sem ação.

### Implementation for User Story 2

- [x] T013 [P] [US2] Implementar `TextoLimitacoes` em
      `apps/web/src/components/TextoLimitacoes.tsx`
- [x] T014 [US2] Incluir `TextoLimitacoes` e `Disclaimer` (reaproveitado de
      `specs/001-dashboard`) em `DetalheSerie.tsx` (T012)

**Checkpoint**: guardrail de transparência coberto.

---

## Phase 5: User Story 3 - Confirmar consistência com Dashboard (Priority: P2)

**Goal**: variação idêntica entre as duas telas.

### Tests for User Story 3

- [x] T015 [P] [US3] Teste de integração: mesma `dataReferencia`/indicador retorna `variacao`
      idêntica em `GET /indicadores` e `GET /indicadores/:id/serie`, em
      `apps/api/tests/integration/consistencia-variacao.test.ts`

**Checkpoint**: todas as user stories funcionais e testadas.

---

## Phase 6: Polish

- [x] T016 Rodar `quickstart.md` manualmente, incluindo o cenário de histórico incompleto
      (`historicoCompleto: false`)

---

## Dependencies & Execution Order

- Foundational (T002-T004) → US1 (T005-T012) → US2 (T013-T014) → US3 (T015) → Polish
- US2 depende de US1 (T012 já existir) para incluir o texto na mesma página.

## Parallel Example: User Story 1

```bash
Task: "Teste de domínio janela-historico em apps/api/tests/domain/janela-historico.test.ts"
Task: "Teste HTTP serie.routes em apps/api/tests/http/serie.routes.test.ts"
Task: "useSerie em apps/web/src/hooks/use-serie.ts"
```

## Implementation Strategy

MVP = Foundational + US1 + US2 (texto de limitações é guardrail, não opcional). US3 (teste de
consistência cross-feature) fecha o critério de aceite compartilhado com o Dashboard.
