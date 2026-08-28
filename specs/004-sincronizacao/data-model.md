# Data Model: Sincronização

## Indicador (referência — definido pela feature Dashboard, reaproveitado aqui)

Ver [specs/001-dashboard/data-model.md](../001-dashboard/data-model.md). Este módulo apenas
consome `indicador_id` e `tipo_serie` para saber qual client/regra de frequência aplicar.

## Observacao

Representa uma medição pontual de um indicador em uma data de referência.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | serial/uuid | PK |
| `indicador_id` | FK → indicador | obrigatório |
| `data_referencia` | date | data da observação na fonte (não confundir com data de ingestão) |
| `valor` | numeric | valor bruto publicado pela fonte |
| `criado_em` | timestamp | data de ingestão pelo Pulse FX (auditoria, nunca exibida como "data de referência") |

**Unicidade**: `(indicador_id, data_referencia)` — upsert nesta chave garante idempotência do job
(research.md).

**Validação de domínio**: `valor` não pode ser nulo/NaN; `data_referencia` não pode ser futura.

## JobExecucao (log mínimo de auditoria)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | serial/uuid | PK |
| `indicador_id` | FK → indicador | qual série foi sincronizada |
| `executado_em` | timestamp | quando o job rodou |
| `origem` | enum | `agendado` \| `admin` |
| `status` | enum | `sucesso` \| `falha_fonte_externa` |
| `detalhe` | text nullable | mensagem de erro, se houver |

**Rationale**: não é requisito de produto (vision marca painel de observabilidade como fora de
escopo), mas um log mínimo é o menor artefato que torna FR-006 (falha não derruba o produto)
verificável em teste de integração sem precisar de ferramenta externa de log.
