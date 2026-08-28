# Implementation Plan: Detalhe de série

**Branch**: `002-detalhe-serie` | **Date**: 2026-08-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-detalhe-serie/spec.md`

## Summary

Endpoint `GET /indicadores/:id/serie` retorna a janela de histórico padrão por tipo de série (30
observações diárias / 12 observações mensais) com variação calculada pelo mesmo `VariacaoService`
do Dashboard, mais o texto de limitações dos dados. Frontend renderiza tabela/gráfico simples +
texto de limitações + disclaimer herdado.

## Technical Context

**Language/Version**: Node.js 24 LTS + TypeScript strict (API); React 19 + TypeScript (web)

**Primary Dependencies**: Fastify, `pg`, React 19 (biblioteca de gráfico: nenhuma nova — tabela
simples é suficiente e satisfaz o requisito do readme sem dependência extra, ver ADR abaixo)

**Storage**: PostgreSQL — leitura de `indicador` + `observacao` (mesmas tabelas do Dashboard)

**Testing**: Vitest — domínio (janela de histórico por tipo de série, reaproveitando
`VariacaoService`), HTTP (contrato do endpoint), frontend (componente de série)

**Target Platform**: mesmo da Dashboard — API em container Docker, web via Vite

**Project Type**: web application (mesmo monorepo)

**Performance Goals**: sem meta específica — leitura de no máximo 30 linhas por indicador

**Constraints**: variação idêntica ao Dashboard para mesmo indicador/data (FR-006); nunca
interpolar lacuna de calendário (FR-001, edge case)

**Scale/Scope**: 4 indicadores, 1 endpoint, 1 tela

## Constitution Check

`.specify/memory/constitution.md` ainda é o template placeholder — sem gates adicionais. Nenhum
gate bloqueado.

## ADR: Tabela vs. gráfico

**Contexto**: readme exige "série temporal — tabela ou gráfico simples", sem prescrever qual.

**Alternativas**: (a) tabela HTML simples; (b) gráfico com biblioteca (Recharts, Chart.js, etc.).

**Decisão**: tabela HTML simples nesta rodada.

**Vantagens**: zero dependência nova, trivialmente testável (renderiza linhas = observações),
acessível por padrão (screen reader lê tabela nativamente).

**Desvantagens**: menos "visual" que um gráfico para perceber tendência de relance.

**Trade-off aceito**: MVP avaliado por qualidade de engenharia, não por polish visual (ver
`fullstack-architect.md` — "não é escopo do MVP... over-engineering pesa contra"). Trocar por
gráfico depois é um ADR futuro isolado, sem impacto em domínio/API (a UI consome o mesmo
`GET /indicadores/:id/serie`).

## Project Structure

### Documentation (this feature)

```text
specs/002-detalhe-serie/
├── plan.md
├── research.md
├── data-model.md         # SerieResult (DTO), texto de limitações
├── quickstart.md
├── contracts/            # GET /indicadores/:id/serie
└── tasks.md
```

### Source Code (repository root)

```text
apps/api/src/
├── domain/indicador/               # + limitacoes.ts (novo), reaproveita VariacaoService
├── application/indicador/          # + obter-serie.ts (novo)
├── infrastructure/persistence/postgres/  # + método de janela no IndicadorRepository (extensão)
└── interface/http/routes/          # + GET /indicadores/:id/serie (novo)

apps/web/src/
├── pages/                # DetalheSerie.tsx (novo)
├── components/           # SerieTabela.tsx, TextoLimitacoes.tsx (novos)
└── hooks/                # use-serie.ts (novo)

apps/api/tests/
├── domain/         # janela-historico.test.ts
└── http/           # serie.routes.test.ts
```

**Structure Decision**: estende `domain/indicador` e `application/indicador` já criados pelo
Dashboard — não duplica `VariacaoService`.

## Complexity Tracking

Nenhuma violação de constitution a justificar.
