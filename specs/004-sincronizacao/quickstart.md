# Quickstart: Sincronização

## Pré-requisitos

- `docker-compose up -d postgres`
- `npm run migrate -w apps/api` (roda `node-pg-migrate up`)
- `.env` com `ADMIN_SYNC_KEY` definido (novo — adicionar a `.env.example`)

## Validar job agendado

1. `npm run dev:api`
2. Aguardar o próximo disparo do cron (ou usar o endpoint admin para não esperar — passo abaixo).
3. Consultar Postgres: `SELECT * FROM observacao ORDER BY criado_em DESC LIMIT 5;` — deve haver uma
   linha por indicador com `data_referencia` recente.

## Validar endpoint admin

```bash
curl -X POST http://localhost:3000/admin/sync \
  -H "X-Admin-Key: $ADMIN_SYNC_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Esperado: `202 { "status": "accepted", ... }`. Sem header: `401`.

## Validar resiliência a fonte indisponível

1. Simular indisponibilidade (ex.: apontar `FRED_API_KEY` inválido ou bloquear egress temporário).
2. Disparar sync via endpoint admin.
3. Verificar: `Observacao` de FEDFUNDS mantém o último valor válido (não é sobrescrita com erro);
   `JobExecucao` registra `status = falha_fonte_externa` para essa execução; Dashboard/Detalhe
   continuam respondendo normalmente com o dado anterior.
