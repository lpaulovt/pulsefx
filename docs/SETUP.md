# Pulse FX — Setup e Execução

Documentação operacional: como rodar o projeto localmente, com o quê, e onde. Para requisitos
de produto e critérios de aceite, ver [specs/](../specs/) (design técnico por feature) e o
[readme.md](../readme.md) raiz (briefing do processo seletivo).

## 1. Visão geral

Pulse FX é um MVP que acompanha câmbio (USD/BRL) e indicadores macro (Selic, IPCA, FEDFUNDS) a
partir de fontes públicas (BCB, FRED), com dados persistidos em Postgres, API própria (Fastify)
e cliente web (React). Contexto completo de produto e critérios de avaliação: [readme.md](../readme.md).

## 2. Pré-requisitos

| Ferramenta | Versão | Verificar |
|---|---|---|
| Node.js | 24+ (ver `.nvmrc`) | `node -v` |
| npm | 10+ (vem com Node 24) | `npm -v` |
| Docker + Docker Compose | qualquer versão recente com `docker compose` (v2, sem hífen) | `docker compose version` |

Sistema operacional: testado em macOS. Linux deve funcionar sem alteração (scripts são `sh`
puro). Windows: rodar via WSL2 ou Git Bash — os scripts npm usam `sh -c` para carregar `.env`.

## 3. Stack tecnológica

| Camada | Tecnologia | Por quê |
|---|---|---|
| Backend | Node.js 24 + TypeScript `strict`, **Fastify 5** | Validação de schema nativa (encaixa com Zod), performance, TypeScript de primeira classe |
| Validação | **Zod 4** | Validação de entrada em toda rota HTTP |
| Banco | **PostgreSQL 17** (Docker), **`pg`** driver cru (sem ORM) + **`node-pg-migrate`** | SQL direto, controle total, migrations versionadas sem mágica de ORM |
| Agendamento | **`node-cron`** | Sincronização periódica das fontes externas (BCB/FRED), sem infra extra (sem fila/Redis) |
| Autenticação | **Clerk** (`@clerk/fastify` no backend, `@clerk/clerk-react` no frontend) | Único ponto do MVP com login — feature "Meus indicadores" (favoritos) |
| Frontend | **React 19** + **Vite 7**, TypeScript `strict` | SPA simples, sem framework de estado global (escopo não pede) |
| Testes | **Vitest 4** (api e web), `@testing-library/react` (web) | Mesmo runner nos dois workspaces, rápido, ESM nativo |
| Monorepo | **npm workspaces** (`apps/*`, `packages/*`) | Nativo, sem ferramenta de build adicional (Turborepo/Nx não necessários neste porte) |
| Orquestração de dev | **`concurrently`** | Sobe api + web com um comando só, saída colorida por processo |
| Containerização | **Docker Compose** | Postgres local; `Dockerfile` de `apps/api` para deploy containerizado |

Decisões técnicas detalhadas (ADRs) vivem em `specs/<feature>/plan.md` e `research.md` de cada
feature — ver seção 8.

## 4. Como rodar do zero

```bash
git clone <este-repositório> && cd pulsefx
nvm use            # ou garanta Node 24+ manualmente
cp .env.example .env
npm install
npm run dev
```

`npm run dev` sobe **tudo** com um único comando:

1. `predev` (roda automaticamente antes de `dev`): `docker compose up -d --wait postgres`
   (sobe Postgres 17 e espera o healthcheck) + `npm run migrate:up` (aplica migrations
   pendentes).
2. `dev`: `concurrently` inicia `apps/api` (`tsx watch`, porta **3000**) e `apps/web`
   (`vite`, porta **5173**) juntos, com saída rotulada `[api]`/`[web]`.

Nenhum passo manual escondido — não precisa de `source .env`: a API carrega o `.env` da raiz
sozinha (`apps/api/src/infrastructure/config/env.ts`), e o Vite também (`envDir` em
`apps/web/vite.config.ts`).

- Web: http://localhost:5173
- API: http://localhost:3000 (`GET /health`, `GET /indicadores`)

Sem chave Clerk real em `.env`, tudo funciona **exceto** login/favoritos (Dashboard, Detalhe de
série e Sincronização não exigem conta). Para habilitar login de verdade, ver seção 6.

## 5. Comandos individuais

| Comando | O que faz |
|---|---|
| `npm run dev:api` | Só a API (`apps/api`, porta 3000) |
| `npm run dev:web` | Só o web (`apps/web`, porta 5173) |
| `npm run migrate:up` | Aplica migrations pendentes (Postgres precisa estar up) |
| `npm run migrate -w apps/api -- down` | Reverte a última migration |
| `npm run test` | Testes de todos os workspaces (`apps/api` + `apps/web`) |
| `npm run test -w apps/api` | Só testes do backend |
| `npm run test -w apps/web` | Só testes do frontend |
| `npm run typecheck` | `tsc --noEmit` em todos os workspaces |
| `npm run lint` | ESLint em todos os workspaces |
| `npm run build` | Build de produção de todos os workspaces |
| `docker compose up -d postgres` | Só o Postgres, sem subir api/web |
| `docker compose down` | Para e remove os containers (mantém o volume de dados) |

## 6. Variáveis de ambiente

Lista completa e comentada em [`.env.example`](../.env.example). Resumo:

| Variável | Obrigatória | Efeito se ausente/placeholder | Onde conseguir |
|---|---|---|---|
| `DATABASE_URL` | Sim | API não sobe | Gerada a partir de `POSTGRES_*` — já vem pronta no `.env.example` para uso com Docker Compose local |
| `PORT` / `CORS_ORIGIN` | Não | Usa default (`3000` / `http://localhost:5173`) | — |
| `FRED_API_KEY` | Não* | Sincronização de FEDFUNDS falha; BCB (PTAX/Selic/IPCA) continua funcionando (não exige chave) | [fredaccount.stlouisfed.org/apikeys](https://fredaccount.stlouisfed.org/apikeys) |
| `SYNC_TTL_MINUTES` | Não | Usa default (60) | — |
| `ADMIN_SYNC_KEY` | Sim para usar `/admin/sync` | Endpoint fica com a chave placeholder (`changeme`) — funciona local, mas não deve ir pra produção assim | Defina qualquer string forte |
| `CLERK_SECRET_KEY` | Só p/ favoritos | Login/favoritos não autentica de verdade (backend rejeita sessão) | Dashboard do Clerk → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Só p/ favoritos | Idem (backend) | Dashboard do Clerk → API Keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | Só p/ favoritos | Frontend não consegue montar `<SignIn>`/`<SignUp>` reais | Mesma chave publicável do Clerk (prefixo `VITE_` obrigatório — única exposta ao bundle) |

\* BCB (Olinda/SGS) não exige chave — confirmado por chamada real durante a pesquisa de
`specs/004-sincronizacao`.

Passo a passo de validação de login com Clerk real (Backend API, sem depender de humano
clicando em UI): [`specs/003-favoritos/quickstart.md`](../specs/003-favoritos/quickstart.md).

## 7. Estrutura do monorepo

```text
pulsefx/
├── apps/
│   ├── api/              # Fastify + TypeScript — camadas Domain/Application/Infrastructure/Interface
│   └── web/              # React 19 + Vite — páginas/componentes/hooks/services
├── packages/
│   └── shared-types/     # DTOs do contrato HTTP entre api e web (nunca tipo de domínio interno)
├── specs/                # Spec Kit: spec.md/plan.md/tasks.md por feature (ver seção 8)
├── docs/
│   ├── SETUP.md          # este arquivo
│   ├── product/          # visão de produto por feature (vision.md, PDR)
│   └── architecture/     # diagrama de arquitetura (HTML interativo)
├── docker-compose.yml    # Postgres (dev) + build da API (deploy containerizado)
└── readme.md             # briefing do processo seletivo + decisões documentadas por feature
```

## 8. Documentação relacionada

- **Specs por feature** (requisitos, plano técnico, tasks, contratos de API):
  - [specs/004-sincronizacao](../specs/004-sincronizacao/spec.md) — job de sincronização, endpoint admin
  - [specs/001-dashboard](../specs/001-dashboard/spec.md) — cards de indicadores, regra de variação
  - [specs/002-detalhe-serie](../specs/002-detalhe-serie/spec.md) — histórico, limitações dos dados
  - [specs/003-favoritos](../specs/003-favoritos/spec.md) — login (Clerk), "Meus indicadores"
- **Visão de produto**: [docs/product/](product/) (vision.md por feature, PDR de seleção de indicadores)
- **Arquitetura**: [docs/architecture/pulsefx-architecture.html](architecture/pulsefx-architecture.html)
  (diagrama interativo — módulos, camadas, fluxo de dado)
- **Briefing e decisões de produto/infra registradas**: [readme.md](../readme.md) raiz
  (seções 10-12: política de sincronização, estratégia Clerk, este setup)

## 9. Troubleshooting

- **Porta 5432 já em uso** (ex.: Postgres nativo/Homebrew já rodando na máquina): defina
  `POSTGRES_PORT` no seu `.env` para outra porta (ex.: `5433`) — `DATABASE_URL` deve usar a mesma
  porta. `docker-compose.yml`/`.env.example` continuam com o default `5432` para não afetar
  outros ambientes/CI.
- **`.env` não carregado / API lendo valor errado**: só acontece se você rodar a API fora do
  fluxo `npm run dev`/`npm run migrate:up` (que já carregam `.env` sozinhos). Rodando algo
  manualmente fora desses scripts, use `set -a && source .env && set +a` antes.
- **Login via browser automatizado trava sem erro** (ex.: script/E2E scriptado): é o Cloudflare
  Turnstile (anti-bot) da Clerk bloqueando automação — comportamento esperado e documentado pela
  própria Clerk, não é bug do Pulse FX. Para validar sem UI, use o método de sessão real via
  Backend API descrito em `specs/003-favoritos/quickstart.md`; para E2E de verdade em CI, use
  `@clerk/testing` com Playwright/Cypress.
- **`docker compose up` (stack completa, não só `postgres`) não autentica no Clerk**: o serviço
  `api` do `docker-compose.yml` ainda não repassa `CLERK_SECRET_KEY`/`CLERK_PUBLISHABLE_KEY` ao
  container (só usado hoje via `npm run dev`, que roda a API fora do Docker) — pendência
  conhecida, não bloqueia o fluxo de desenvolvimento padrão.
