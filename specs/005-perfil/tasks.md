# Tasks: Perfil

**Input**: Design documents from `specs/005-perfil/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [quickstart.md](quickstart.md)

**Tests**: incluídas — cobre componente/página no frontend (readme.md seção 7). Sem mudança de
backend nesta feature.

**Depends on**: `specs/003-favoritos` (Clerk configurado, guarda de rota, design system da
issue #47).

## Phase 1: Foundational

- [x] T001 Confirmar, contra a versão instalada (`@clerk/clerk-react@5.61.3`), o shape exato da
      prop `appearance` (Core 2 vs Core 3 — ver `research.md`) antes de aplicar em T002.
- [x] T002 Aplicar `appearance` (variables: `colorPrimary`, `colorBackground`, `colorText`,
      `borderRadius` mapeados dos tokens de `apps/web/src/styles/tokens.css`) em `<SignIn>`/
      `<SignUp>` de `apps/web/src/pages/Login.tsx`

**Checkpoint**: login/cadastro visualmente alinhados ao design system.

---

## Phase 2: User Story 1 - Login/cadastro com identidade visual (Priority: P1) 🎯 MVP

**Goal**: `<SignIn>`/`<SignUp>` usam a paleta/tipografia do Pulse FX.

**Independent Test**: abrir `#login`, inspecionar cor/fonte do formulário.

### Implementation for User Story 1

- (coberto por T002 da fase Foundational — não há mais tasks nesta user story)

**Checkpoint**: US1 completa junto com a fundação.

---

## Phase 3: User Story 2 - Ver dados da própria conta (Priority: P1)

**Goal**: tela Perfil mostra e-mail/nome/data de criação da conta.

**Independent Test**: logar, acessar Perfil, conferir dados exibidos; sem sessão, confirmar
redirecionamento pra Login.

### Tests for User Story 2

- [x] T003 [P] [US2] Teste de frontend: `Perfil` renderiza e-mail/data com `useUser()` mockado
      (com e sem nome cadastrado), em `apps/web/tests/frontend/Perfil.test.tsx`
- [x] T004 [P] [US2] Teste de frontend: guarda de rota redireciona pra Login sem sessão (mesmo
      padrão de `App.test.tsx` já existente para "Meus indicadores")

### Implementation for User Story 2

- [x] T005 [US2] Implementar página `Perfil` (e-mail, nome condicional, data de criação) em
      `apps/web/src/pages/Perfil.tsx` + `Perfil.module.css`
- [x] T006 [US2] Adicionar rota `"perfil"` em `apps/web/src/App.tsx`, com a mesma guarda
      `<SignedIn>`/`<SignedOut>` já usada para `"meus-indicadores"`

**Checkpoint**: Perfil funcional e protegido.

---

## Phase 4: User Story 3 - Navegar entre Perfil e Meus indicadores (Priority: P2)

**Goal**: link visível nos dois sentidos, mais um ponto de entrada pro Perfil a partir de tela
autenticada.

**Independent Test**: navegar Perfil → Meus indicadores e voltar; confirmar link pro Perfil
visível no Dashboard ou em Meus indicadores.

### Implementation for User Story 3

- [x] T007 [US3] Adicionar link `#meus-indicadores` dentro de `Perfil.tsx` (T005)
- [x] T008 [US3] Adicionar link `#perfil` visível em `apps/web/src/pages/MeusIndicadores.tsx`
      (ponto de entrada mais natural, já é tela autenticada)

**Checkpoint**: todas as user stories funcionais.

---

## Phase 5: Polish

- [x] T009 Rodar `quickstart.md` manualmente (aparência do login + fluxo completo do Perfil)
- [x] T010 Confirmar suíte completa sem regressão: `npm run test -w apps/web` (novos testes +
      existentes) e `npm run test -w apps/api` (deve continuar 48/48, zero mudança de backend)

---

## Dependencies & Execution Order

- Foundational (T001-T002) → US1 (coberta) → US2 (T003-T006) → US3 (T007-T008) → Polish
- T006 depende de `Perfil.tsx` (T005) existir antes de rotear pra ele.

## Implementation Strategy

MVP = Foundational (login customizado) + US2 (Perfil em si). US3 (navegação cruzada) é rápido e
de baixo risco, entra na mesma leva.
