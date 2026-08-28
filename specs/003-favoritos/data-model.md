# Data Model: Favoritos

## Favorito

| Campo | Tipo | Regra |
|---|---|---|
| `user_id` | text | id do usuário Clerk (não FK local — Clerk é a fonte de verdade de identidade) |
| `indicador_id` | FK → indicador | um dos 4 indicadores do PDR |
| `criado_em` | timestamp | auditoria |

**Unicidade**: `(user_id, indicador_id)` — marcar duas vezes o mesmo indicador é idempotente
(upsert), desmarcar é delete por essa chave.

**Sem entidade `Usuario` própria**: Pulse FX não replica cadastro de usuário — `user_id` é apenas
uma string vinda do token Clerk validado por `getAuth()` (ver `research.md`).
