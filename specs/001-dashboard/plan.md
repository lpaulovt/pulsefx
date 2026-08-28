# Implementation Plan: Dashboard

**Branch**: `001-dashboard` | **Date**: 2026-08-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-dashboard/spec.md`

## Summary

Endpoint `GET /indicadores` retorna, para os 4 indicadores do PDR, último valor, data de
referência e variação (calculada por um serviço de domínio compartilhado com o Detalhe). Frontend
(`apps/web`) renderiza um card por indicador com estado explícito quando não há variação
calculável, e o disclaimer educacional fixo na tela.

## Technical Context

**Language/Version**: Node.js 24 LTS + TypeScript strict (API); React 19 + TypeScript (web)

**Primary Dependencies**: Fastify, `pg`, `zod` (validação de resposta), React 19, Vite (já
scaffolded em `apps/web`)

**Storage**: PostgreSQL — leitura de `indicador` + `observacao` (populadas por
`specs/004-sincronizacao`)

**Testing**: Vitest (domínio: cálculo de variação; HTTP: contrato do endpoint; frontend: hook/
componente do card)

**Target Platform**: API em container Docker; web servido via Vite build (estático)

**Project Type**: web application (`apps/api` + `apps/web`, monorepo já scaffolded)

**Performance Goals**: resposta do dashboard não depende de chamada externa — leitura pura de
Postgres já sincronizado; sem meta de latência específica além de "não travar por I/O externo"
(garantido por construção, ver FR-009 do spec.md)

**Constraints**: FR-009 — carregar o dashboard NUNCA dispara chamada a BCB/FRED; variação idêntica
entre Dashboard e Detalhe (FR-006)

**Scale/Scope**: 4 indicadores, 1 endpoint de leitura, 1 tela

## Constitution Check

`.specify/memory/constitution.md` ainda é o template placeholder — sem gates adicionais além dos
requisitos do `readme.md`. Nenhum gate bloqueado.

## Project Structure

### Documentation (this feature)

```text
specs/001-dashboard/
├── plan.md
├── research.md          # cálculo de variação (domínio compartilhado com Detalhe)
├── data-model.md         # Indicador (canônico), Observacao (referência), VariacaoResult
├── quickstart.md
├── contracts/            # GET /indicadores
└── tasks.md
```

### Source Code (repository root)

```text
apps/api/src/
├── domain/indicador/               # Indicador, TipoSerie, VariacaoResult, VariacaoService (novo)
├── application/indicador/          # caso de uso "ObterDashboard" (novo)
├── infrastructure/persistence/postgres/  # IndicadorRepository (leitura, novo)
└── interface/http/routes/          # GET /indicadores (novo)

apps/web/src/
├── pages/                # Dashboard.tsx (novo)
├── components/           # IndicadorCard.tsx, Disclaimer.tsx (novos)
├── hooks/                # useDashboard.ts (novo — fetch + estado)
└── services/             # api-client.ts (novo — chama apps/api, nunca BCB/FRED direto)

apps/api/tests/
├── domain/         # variacao-service.test.ts
└── http/           # indicadores.routes.test.ts

apps/web/tests/frontend/
└── use-dashboard.test.tsx (ou IndicadorCard.test.tsx)
```

**Structure Decision**: reaproveita camadas já scaffoldadas; `VariacaoService` fica em
`domain/indicador` porque é regra de domínio compartilhada por Dashboard e Detalhe (evita
duplicação — ver `research.md`).

## Complexity Tracking

Nenhuma violação de constitution a justificar.
