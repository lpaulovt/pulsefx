# Implementation Plan: Perfil

**Branch**: `005-perfil` | **Date**: 2026-08-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-perfil/spec.md`

## Summary

Customizar `appearance` de `<SignIn>`/`<SignUp>` (Clerk) com os tokens de design já existentes;
criar página `Perfil` (protegida, mesma guarda de rota de "Meus indicadores") mostrando e-mail/
nome/data de criação da conta via `useUser()`; adicionar link cruzado Perfil ↔ Meus indicadores
e um ponto de entrada pro Perfil a partir de tela autenticada. 100% frontend — zero mudança em
`apps/api`.

## Technical Context

**Language/Version**: React 19 + TypeScript strict (já scaffolded, `apps/web`)

**Primary Dependencies**: `@clerk/clerk-react` (já instalado, `^5.61.3` — nenhuma dependência
nova)

**Storage**: Nenhuma nova — dado de conta vem do Clerk (client-side), favoritos continuam em
Postgres via `GET /favoritos` já existente

**Testing**: Vitest + `@testing-library/react` (mesmo padrão de `specs/003-favoritos`/`004-*`)

**Target Platform**: Mesmo do resto do frontend — servido via Vite

**Project Type**: Web application (frontend-only nesta feature)

**Performance Goals**: N/A — leitura client-side, sem chamada de rede nova

**Constraints**: FR-007 do spec.md — nenhuma tabela/coluna/endpoint novo no backend

**Scale/Scope**: 1 componente de aparência customizado, 1 página nova, 2 pontos de navegação

## Constitution Check

`.specify/memory/constitution.md` ainda é o template placeholder — sem gates adicionais além
dos requisitos do `readme.md`. Nenhum gate bloqueado.

## ADR: Sem estado global novo (Context/Redux) para dado de perfil

**Contexto**: `useUser()` do Clerk já expõe o dado de conta globalmente via `ClerkProvider`
(que já envolve o app inteiro desde `specs/003-favoritos`).

**Alternativas**: (a) usar `useUser()` direto na página; (b) criar um hook `use-perfil.ts`
"encapsulando" `useUser()`; (c) Context próprio de perfil.

**Decisão**: (a) — usar `useUser()` direto no componente `Perfil.tsx`.

**Vantagens**: zero código extra sem ganho — não há transformação de dado nem lógica além de
"pegar o que já existe e exibir"; segue o próprio padrão de simplicidade do `plan.md` de
`favoritos` (não envolver o que não precisa).

**Desvantagens**: se amanhã o Perfil precisar de lógica adicional (ex.: combinar com dado do
Pulse FX), precisaria refatorar pra um hook — aceitável, YAGNI aplica.

## Project Structure

### Documentation (this feature)

```text
specs/005-perfil/
├── plan.md              # este arquivo
├── research.md           # customização de appearance, origem do dado, navegação
├── quickstart.md          # como validar localmente
└── tasks.md               # gerado por /speckit-tasks
```

Sem `data-model.md`/`contracts/` — nenhuma entidade nova de domínio nem endpoint novo (FR-007).

### Source Code (repository root)

```text
apps/web/src/
├── pages/
│   ├── Login.tsx                 # + prop appearance (extensão, não recriado)
│   ├── Login.module.css          # ajuste se necessário (o essencial é a prop appearance)
│   ├── Perfil.tsx                 # novo
│   └── Perfil.module.css          # novo
├── App.tsx                        # + rota "perfil" (hash routing já existente, extensão)
├── pages/Dashboard.tsx            # + link pro Perfil (extensão pontual)
└── pages/MeusIndicadores.tsx      # + link pro Perfil (extensão pontual)

apps/web/tests/frontend/
└── Perfil.test.tsx                # novo — renderiza dado de useUser mockado, guarda de rota
```

**Structure Decision**: `Perfil.tsx` segue exatamente o padrão de página já usado (`MeusIndicadores.tsx`
como referência mais próxima — mesma guarda de rota via `<SignedIn>`/`<SignedOut>` em `App.tsx`).

## Complexity Tracking

Nenhuma violação de constitution a justificar.
