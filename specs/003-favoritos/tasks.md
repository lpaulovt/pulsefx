# Tasks: Meus indicadores (favoritos)

**Input**: Design documents from `specs/003-favoritos/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/favoritos.md](contracts/favoritos.md)

**Depends on**: `specs/001-dashboard` (DashboardItem, IndicadorRepository).

## Phase 1: Setup

- [x] T001 Adicionar `@clerk/fastify` a `apps/api/package.json` e `@clerk/clerk-react` a
      `apps/web/package.json` (confirmar versão atual antes de instalar — ver research.md)
- [x] T002 Adicionar `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` a
      `.env.example` e `env.ts`
- [x] T003 [P] Criar migration para tabela `favorito` (`user_id`, `indicador_id`,
      unique `(user_id, indicador_id)`) em `apps/api/migrations/`

---

## Phase 2: Foundational

- [x] T004 Registrar `clerkPlugin()` em `apps/api/src/interface/http/server.ts` via novo
      `apps/api/src/infrastructure/auth/clerk-plugin.ts`
- [x] T005 [P] Implementar `FavoritoRepository` (upsert/delete por `(user_id, indicador_id)`, list
      por `user_id`) em `apps/api/src/infrastructure/persistence/postgres/favorito-repository.ts`
- [x] T006 [P] Envolver `apps/web/src/main.tsx` com `<ClerkProvider>`
- [x] T007 [US1] Implementar página `Login` com `<SignIn>`/`<SignUp>` do Clerk em
      `apps/web/src/pages/Login.tsx` (FR-004a — único ponto do MVP com autenticação)
- [x] T008 [US1] Implementar guarda de rota (`<SignedIn>`/`<SignedOut>` do Clerk) redirecionando
      para `Login` ao acessar `MeusIndicadores` sem sessão, em `apps/web/src/App.tsx`

**Checkpoint**: infraestrutura de auth (backend + UI de login) pronta — user stories podem começar.

---

## Phase 3: User Story 1 - Marcar e desmarcar favorito (Priority: P1) 🎯 MVP

**Goal**: `POST`/`DELETE /favoritos/:indicadorId` funcionam para usuário autenticado.

**Independent Test**: com sessão Clerk válida, marcar e desmarcar um indicador via `curl`.

### Tests for User Story 1

- [x] T009 [P] [US1] Teste HTTP: 401 sem sessão, 204 com sessão válida (marcar/desmarcar), em
      `apps/api/tests/http/favoritos.routes.test.ts`
- [x] T010 [P] [US1] Teste de persistência: upsert idempotente em
      `apps/api/tests/persistence/favorito-repository.test.ts`

### Implementation for User Story 1

- [x] T011 [US1] Implementar casos de uso `MarcarFavorito`/`DesmarcarFavorito` em
      `apps/api/src/application/favorito/` (usa T005)
- [x] T012 [US1] Implementar rotas `POST`/`DELETE /favoritos/:indicadorId` em
      `apps/api/src/interface/http/routes/favoritos.routes.ts` (usa `getAuth`, T004, T011)
- [x] T013 [P] [US1] Implementar `BotaoFavoritar` (chama POST/DELETE, estado otimista, exige
      sessão — usa guarda de T008) em `apps/web/src/components/BotaoFavoritar.tsx`
- [x] T014 [US1] Incluir `BotaoFavoritar` em `IndicadorCard` (specs/001-dashboard) — decisão de UI
      já aberta na vision, resolvida aqui: card do Dashboard ganha o controle

**Checkpoint**: marcar/desmarcar funcional, incluindo fluxo de login quando necessário.

---

## Phase 4: User Story 2 - Favorito sobrevive a reload/troca de dispositivo (Priority: P1)

**Goal**: `GET /favoritos` retorna favoritos do usuário autenticado, consistente entre sessões.

**Independent Test**: marcar favorito, novo login (mesma conta, outro navegador simulado), `GET
/favoritos` retorna o mesmo indicador.

### Tests for User Story 2

- [x] T015 [P] [US2] Teste de integração: marcar → nova "sessão" (novo token da mesma conta) →
      favorito ainda presente, em `apps/api/tests/integration/favoritos-persistencia.test.ts`

### Implementation for User Story 2

- [x] T016 [US2] Implementar caso de uso `ListarFavoritos` (reaproveita `ObterDashboard` de
      specs/001-dashboard filtrado por favoritos) em `apps/api/src/application/favorito/listar-favoritos.ts`
- [x] T017 [US2] Implementar rota `GET /favoritos` em `favoritos.routes.ts` (T012)
- [x] T018 [P] [US2] Implementar `useFavoritos` (fetch autenticado) em `apps/web/src/hooks/use-favoritos.ts`
- [x] T019 [US2] Implementar página `MeusIndicadores` em `apps/web/src/pages/MeusIndicadores.tsx`
      (reaproveita `IndicadorCard` de specs/001-dashboard; protegida pela guarda de T008)

**Checkpoint**: favoritos persistem e são visíveis em tela própria.

---

## Phase 5: User Story 3 - Estado vazio (Priority: P3)

**Goal**: "Meus indicadores" sem favoritos mostra mensagem explícita.

### Implementation for User Story 3

- [x] T020 [US3] Tratar `indicadores: []` em `MeusIndicadores.tsx` (T019) — mensagem orientando a
      ir ao Dashboard, nunca tela em branco

**Checkpoint**: todas as user stories funcionais.

---

## Phase 6: Polish

- [ ] T021 Documentar estratégia de identidade (Clerk) no `readme.md` raiz (exigência readme seção
      4.3)
- [ ] T022 Rodar `quickstart.md` manualmente (login, marcar, reload, novo login)

---

## Dependencies & Execution Order

- Setup (T001-T003) → Foundational (T004-T008) → US1 (T009-T014) → US2 (T015-T019) → US3 (T020) → Polish
- T007/T008 (login UI + guarda de rota) são pré-requisito real de US1/US2 na prática (usuário
  precisa logar antes de favoritar) — por isso ficam na Foundational, marcados [US1] apenas para
  rastreabilidade de qual requisito os originou.
- US2 depende de US1 (rota base já registrada em T012).
- T014 modifica `IndicadorCard` de `specs/001-dashboard` — coordenar para não conflitar se
  implementado em paralelo com tasks daquela spec.

## Parallel Example: Foundational

```bash
Task: "FavoritoRepository em apps/api/src/infrastructure/persistence/postgres/favorito-repository.ts"
Task: "Envolver main.tsx com ClerkProvider"
```

## Implementation Strategy

MVP = Setup + Foundational (inclui login) + US1 + US2 (persistência real é o critério de aceite
central, não opcional). US3 é rápido, entra junto sem risco.
