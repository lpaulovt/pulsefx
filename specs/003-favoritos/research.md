# Research: Favoritos

Stack transversal já fixada (ver `specs/004-sincronizacao/research.md`). Autenticação é escopo
novo, restrito a esta feature (constraint do usuário: Clerk — ver `spec.md` Clarifications).

## Integração Clerk — backend (Fastify)

- **Decision**: `@clerk/fastify`, plugin `clerkPlugin()` registrado em `server.ts`; rotas de
  favoritos usam `getAuth(request)` para obter `userId` e retornam 401 se ausente.
- **Rationale**: confirmado via docs oficiais (clerk.com/docs/references/fastify) em 2026-08-28 —
  `clerkPlugin()` é o mecanismo padrão de integração com Fastify, anexa `Auth` em
  `request.auth`; `getAuth()` é o helper recomendado para proteger rota. Evita reimplementar
  validação de JWT de sessão manualmente.
- **Env vars necessárias** (adicionar a `.env.example`): `CLERK_SECRET_KEY` (backend),
  `CLERK_PUBLISHABLE_KEY`/`VITE_CLERK_PUBLISHABLE_KEY` (frontend, prefixo `VITE_` obrigatório —
  convenção já usada em `VITE_API_BASE_URL`).
- **Alternatives considered**: validar JWT manualmente com biblioteca genérica (`jose`) — reinventa
  o que o SDK oficial já cobre (rotação de chave, formato de sessão), risco de erro de segurança
  maior que o ganho de não ter dependência do Clerk.
- **Ação pendente pro implementador**: reconfirmar versão exata do pacote (`npm view @clerk/fastify
  versions`) e ler o quickstart oficial antes de instalar — esta pesquisa confirma o mecanismo, não
  fixa versão (regra do `fullstack-architect`: nunca afirmar "versão mais recente" sem checar no
  momento da implementação).

## Integração Clerk — frontend (React)

- **Decision**: `@clerk/clerk-react`, `<ClerkProvider>` na raiz (`main.tsx`), hook `useAuth()` /
  componente `<SignedIn>`/`<SignedOut>` para condicionar UI de favoritos.
- **Rationale**: padrão oficial documentado (clerk.com/docs/references/react/use-auth), evita
  gerenciar estado de sessão manualmente no frontend.

## Escopo de autenticação

- **Decision**: login exigido apenas para marcar/ver favoritos (FR-004a) — Dashboard, Detalhe e
  Sincronização continuam públicos, sem Clerk envolvido.
- **Rationale**: readme não pede conta para nenhuma outra tela; introduzir Clerk globalmente
  (proteger todas as rotas) seria escopo maior do que o pedido, e contradiria a vision de favoritos
  (que já assumia originalmente que autenticação não seria pré-requisito do MVP inteiro).
