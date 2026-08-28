# Implementation Plan: Sincronização

**Branch**: `004-sincronizacao` | **Date**: 2026-08-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-sincronizacao/spec.md`

## Summary

Job agendado (`node-cron`) que sincroniza USD/BRL PTAX (BCB), Meta Selic (BCB), IPCA (BCB) e
FEDFUNDS (FRED) para o modelo interno `Observacao`, com endpoint admin protegido para forçar
sincronização fora do ciclo. Nenhuma tela consumidora (Dashboard/Detalhe/Favoritos) chama BCB/FRED
diretamente — tudo lê Postgres via repositório.

## Technical Context

**Language/Version**: Node.js 24 LTS + TypeScript strict (já fixado em `tsconfig.base.json`)

**Primary Dependencies**: Fastify (HTTP admin endpoint), `pg` (driver Postgres cru), `node-pg-migrate`
(migrations), `node-cron` (agendamento — novo, ver `research.md`), `zod` (validação de payload das
fontes externas antes de entrar no domínio)

**Storage**: PostgreSQL 17 (via `docker-compose.yml` já existente)

**Testing**: Vitest — domínio (normalização/upsert idempotente), infraestrutura (repositório com
banco de teste), integração (job completo contra Postgres de teste)

**Target Platform**: Container Docker (`apps/api/Dockerfile`), Linux

**Project Type**: web-service (monorepo `apps/api` + `apps/web` + `packages/shared-types`, já
scaffolded)

**Performance Goals**: não crítico — job roda no máximo poucas vezes ao dia; sem meta de
throughput além de "não bloquear o event loop durante o fetch/parse das fontes externas"

**Constraints**: nenhuma chamada síncrona a BCB/FRED originada por requisição de usuário final
(FR-005); endpoint admin protegido (FR-004); job idempotente; falha de fonte externa não derruba
Dashboard/Detalhe (FR-006)

**Scale/Scope**: 4 indicadores (séries), 1 job agendado, 1 endpoint admin — escala de MVP/demo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` ainda é o template placeholder (nenhum princípio de projeto
formalizado nesta rodada) — sem gates adicionais além dos requisitos já fixos do `readme.md`
(monorepo, stack, testes, Docker), tratados aqui como constraints de projeto, não como violação a
justificar. Nenhum gate bloqueado.

## Project Structure

### Documentation (this feature)

```text
specs/004-sincronizacao/
├── plan.md              # este arquivo
├── research.md           # decisões técnicas (scheduling, proteção admin, retry, idempotência)
├── data-model.md         # Observacao, JobExecucao
├── quickstart.md         # como validar localmente
├── contracts/            # POST /admin/sync
└── tasks.md              # gerado por /speckit-tasks
```

### Source Code (repository root)

Estrutura já existente no repositório — este módulo ocupa a fatia `sincronizacao` de cada camada:

```text
apps/api/src/
├── domain/sincronizacao/          # regra de normalização de payload → Observacao, idempotência
├── application/sincronizacao/     # caso de uso "executar sincronização" (por indicador/tipo)
├── infrastructure/
│   ├── http-clients/              # BcbClient, FredClient (tradução payload externo → DTO interno)
│   ├── persistence/postgres/      # ObservacaoRepository (upsert), migrations (node-pg-migrate)
│   └── scheduler/                 # novo: registro dos jobs node-cron (não existe ainda)
└── interface/http/routes/         # POST /admin/sync (novo)

apps/api/tests/
├── domain/         # normalização de payload, regra de idempotência
├── persistence/    # upsert (indicador_id, data_referencia) contra Postgres de teste
└── integration/    # job completo: client (fake) → domain → repositório
```

**Structure Decision**: reaproveita as camadas já scaffoldadas (`domain/application/infrastructure/
interface`) e a pasta `sincronizacao` já criada em cada uma. Único diretório novo:
`infrastructure/scheduler/` para o registro dos jobs `node-cron`. Nenhum pacote novo no monorepo —
tudo dentro de `apps/api`.

## Complexity Tracking

Nenhuma violação de constitution a justificar — não preenchido.
