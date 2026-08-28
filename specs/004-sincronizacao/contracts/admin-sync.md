# Contract: POST /admin/sync

Endpoint de contingência (FR-003) para forçar sincronização fora do ciclo agendado.

## Request

```
POST /admin/sync
X-Admin-Key: <ADMIN_SYNC_KEY>
Content-Type: application/json

{ "indicadorId": "usd-brl-ptax" }   // opcional — omitido = sincroniza todos os indicadores
```

## Responses

| Status | Quando | Corpo |
|---|---|---|
| 202 | Sincronização disparada (assíncrona — não bloqueia a resposta) | `{ "status": "accepted", "indicadores": ["usd-brl-ptax"] }` |
| 401 | `X-Admin-Key` ausente ou inválido | `{ "error": "unauthorized" }` |
| 400 | `indicadorId` informado não existe no conjunto do PDR | `{ "error": "unknown_indicador" }` |

## Regras

- Nunca retorna 5xx por falha da fonte externa — a falha é registrada em `JobExecucao` e a
  resposta HTTP permanece 202 (o disparo foi aceito, o resultado é assíncrono).
- Idempotente: chamar duas vezes para o mesmo indicador não duplica `Observacao` (upsert por
  `(indicador_id, data_referencia)`).
