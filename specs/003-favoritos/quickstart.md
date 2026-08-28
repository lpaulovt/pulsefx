# Quickstart: Favoritos

## Pré-requisitos

- Conta Clerk de desenvolvimento criada; `CLERK_SECRET_KEY` e
  `VITE_CLERK_PUBLISHABLE_KEY`/`CLERK_PUBLISHABLE_KEY` em `.env`.
- Postgres up, migrations rodadas (inclui tabela `favorito`).

## Validar API

```bash
npm run dev:api
# obter um token de sessão de teste via Clerk (dashboard de dev ou Testing Tokens da API do Clerk)
curl -X POST http://localhost:3000/favoritos/usd-brl-ptax \
  -H "Authorization: Bearer $CLERK_SESSION_TOKEN"
curl http://localhost:3000/favoritos -H "Authorization: Bearer $CLERK_SESSION_TOKEN"
```

Esperado: 204 no POST; GET retorna array com `usd-brl-ptax`. Sem header: 401 em ambos.

## Validar Web

```bash
npm run dev:web
```

Login via Clerk → marcar favorito no Dashboard → abrir "Meus indicadores" → confirmar que aparece.
Logout e login novamente (mesma conta) → favorito deve persistir. Sem nenhum favorito marcado →
estado vazio orientando a ir ao Dashboard.
