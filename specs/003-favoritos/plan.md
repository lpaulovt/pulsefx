# Implementation Plan: Meus indicadores (favoritos)

**Branch**: `003-favoritos` | **Date**: 2026-08-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-favoritos/spec.md`

## Summary

Usuário autenticado via Clerk marca/desmarca indicadores como favoritos, persistidos em Postgres
vinculados ao `userId` do Clerk. Endpoint `GET /favoritos` reaproveita o mesmo `DashboardItem`
(specs/001-dashboard) filtrado pelos indicadores favoritados do usuário autenticado.

## Technical Context

**Language/Version**: Node.js 24 LTS + TypeScript strict (API); React 19 + TypeScript (web)

**Primary Dependencies**: Fastify, `@clerk/fastify` (novo), `pg`, React 19, `@clerk/clerk-react`
(novo) — ver `research.md` para confirmação de pacotes/versão

**Storage**: PostgreSQL — nova tabela `favorito` (`user_id`, `indicador_id`); `user_id` é o `userId`
do Clerk (string), não uma FK para tabela própria de usuários (Clerk é a fonte de verdade de
identidade, Pulse FX não replica cadastro de usuário)

**Testing**: Vitest — domínio (regra "favorito pertence a um usuário"), persistência (upsert/
delete de favorito), HTTP (401 sem sessão, 200 com sessão), frontend (estado favorito/desfavoritar)

**Target Platform**: mesmo do Dashboard — API em container Docker, web via Vite

**Project Type**: web application (mesmo monorepo)

**Performance Goals**: sem meta específica — volume de favoritos por usuário é pequeno (máximo 4,
um por indicador do PDR)

**Constraints**: FR-004/FR-004a — login obrigatório para marcar/ver favoritos; FR-007 — ação de
favoritar nunca chama BCB/FRED

**Scale/Scope**: 4 indicadores favoritáveis, 1 tabela nova, 2-3 endpoints, 1 tela nova

## Constitution Check

`.specify/memory/constitution.md` ainda é o template placeholder — sem gates adicionais. Nenhum
gate bloqueado.

## ADR: Identificação de usuário via Clerk (não sessão anônima)

**Contexto**: MVP não tinha sistema de contas definido em nenhuma outra parte do readme; favoritos
precisa de identidade estável para persistência real (FR-003).

**Alternativas**: (a) sessão anônima via cookie/device id; (b) conta explícita via provedor
gerenciado (Clerk); (c) híbrida (localStorage + sync).

**Decisão**: (b) — decisão do usuário do produto durante `/speckit-clarify` (ver spec.md
Clarifications), não escolha livre deste plano.

**Vantagens**: persistência realmente estável entre dispositivos (não se perde ao trocar de
navegador); delega gestão de sessão/segurança a provedor especializado, reduzindo superfície de
bug de auth caseira.

**Desvantagens**: introduz autenticação como novo eixo de complexidade no MVP (a única feature que
exige login); dependência de serviço externo (Clerk) para uma função antes puramente opcional.

**Trade-off aceito**: escopo maior que o estritamente pedido pelo readme, mas é decisão explícita
do usuário/dono do produto, não invenção da arquitetura — registrada como tal.

## Project Structure

### Documentation (this feature)

```text
specs/003-favoritos/
├── plan.md
├── research.md           # integração Clerk (backend/frontend)
├── data-model.md          # Favorito
├── quickstart.md
├── contracts/             # POST/DELETE /favoritos/:indicadorId, GET /favoritos
└── tasks.md
```

### Source Code (repository root)

```text
apps/api/src/
├── domain/favorito/                 # Favorito (value object: userId + indicadorId)
├── application/favorito/            # casos de uso: marcar, desmarcar, listar
├── infrastructure/
│   ├── persistence/postgres/        # FavoritoRepository (novo)
│   └── auth/                        # clerk-plugin.ts (registro do clerkPlugin, novo)
└── interface/http/routes/           # favoritos.routes.ts (novo, protegidas por getAuth)

apps/web/src/
├── pages/                 # MeusIndicadores.tsx (novo)
├── components/            # BotaoFavoritar.tsx (novo)
├── hooks/                 # use-favoritos.ts (novo)
└── main.tsx                # + <ClerkProvider> (extensão)

apps/api/tests/
├── domain/         # favorito.test.ts
├── persistence/    # favorito-repository.test.ts
└── http/           # favoritos.routes.test.ts (401 sem sessão)
```

**Structure Decision**: módulo `favorito` já existe vazio no scaffold — este plano o preenche.
Autenticação fica isolada em `infrastructure/auth/`, nunca vazando `Auth`/tipo do Clerk para o
Domain (domínio conhece apenas `userId: string`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Introdução de provedor de autenticação (Clerk) só para esta feature | Persistência real de favorito entre dispositivos exige identidade estável; decisão explícita do usuário/dono do produto | Sessão anônima (cookie/device id) foi considerada e é mais simples, mas foi explicitamente rejeitada na clarificação — não é uma alternativa disponível para este plano, é registro do trade-off aceito |
