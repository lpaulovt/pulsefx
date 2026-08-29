# Quickstart: Favoritos

## Pré-requisitos

- Conta Clerk de desenvolvimento criada; `CLERK_SECRET_KEY` e
  `VITE_CLERK_PUBLISHABLE_KEY`/`CLERK_PUBLISHABLE_KEY` em `.env`.
- Postgres up, migrations rodadas (inclui tabela `favorito`).

## Validar API com sessão real (sem passar pela UI)

Confirmado em 2026-08-28 que login via UI automatizada (browser scriptado) é bloqueado pelo
Cloudflare Turnstile (anti-bot) da Clerk — comportamento esperado, documentado pela própria
Clerk (`@clerk/testing` existe justamente pra isso). Pra validar a API sem depender de humano
clicando em UI, use a Backend API da Clerk (chave secreta) pra criar usuário + sessão + token
reais — é o método que a própria [documentação de testes da
Clerk](https://clerk.com/docs/guides/development/testing/overview#get-a-valid-session-token)
recomenda:

```bash
npm run dev:api

# 1. Criar usuário de teste (email com +clerk_test não conta como envio real, backend API não
#    passa por Turnstile)
curl -s -X POST https://api.clerk.com/v1/users \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" \
  -d '{"email_address":["teste+clerk_test@example.com"],"password":"Senha!Forte123","skip_password_checks":true}'
# guarde o "id" retornado (user_id)

# 2. Criar sessão + token de sessão (JWT válido por 60s, renove se expirar)
SESSION_ID=$(curl -s -X POST https://api.clerk.com/v1/sessions \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\"}" | jq -r .id)
TOKEN=$(curl -s -X POST "https://api.clerk.com/v1/sessions/$SESSION_ID/tokens" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" | jq -r .jwt)

# 3. Testar contra a API do Pulse FX
curl -X POST http://localhost:3000/favoritos/usd-brl-ptax -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/favoritos -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/favoritos  # sem token
```

Esperado: 204 no POST; GET com token retorna array com `usd-brl-ptax`; GET sem token → 401.

**Persistência entre sessões (FR-003)**: revogar a sessão (`POST
/v1/sessions/$SESSION_ID/revoke`), criar uma sessão **nova** pro mesmo `user_id`, e repetir o
`GET /favoritos` com o token novo — o favorito marcado na sessão anterior continua aparecendo.
Validado com sucesso em 2026-08-28 (ver relatório da sessão).

Ao terminar, delete o usuário de teste: `curl -X DELETE https://api.clerk.com/v1/users/$USER_ID
-H "Authorization: Bearer $CLERK_SECRET_KEY"`.

## Validar Web (interativo, com humano)

```bash
npm run dev:web
```

Login via Clerk (formulário real renderiza — "Sign in to pulsefx", domínio
`<seu-app>.clerk.accounts.dev`) → marcar favorito no Dashboard → abrir "Meus indicadores" →
confirmar que aparece. Logout e login novamente (mesma conta) → favorito deve persistir. Sem
nenhum favorito marcado → estado vazio orientando a ir ao Dashboard. Esse fluxo exige um humano
de verdade (ou `@clerk/testing` com Playwright) por causa do Turnstile — não roda em browser
scriptado ad hoc.
