# Contracts: Favoritos

Todas as rotas exigem sessão Clerk válida (cookie/header de sessão) — `getAuth(request).userId`
ausente ⇒ 401 em todas.

## POST /favoritos/:indicadorId

Marca o indicador como favorito do usuário autenticado.

- 204: marcado (idempotente — repetir a chamada não duplica nem falha).
- 401: sem sessão.
- 404: `indicadorId` não existe no conjunto do PDR.

## DELETE /favoritos/:indicadorId

Desmarca o indicador.

- 204: desmarcado (idempotente — desmarcar algo já desmarcado também retorna 204).
- 401: sem sessão.

## GET /favoritos

Retorna os indicadores favoritados do usuário autenticado, no mesmo formato de
`GET /indicadores` (specs/001-dashboard), filtrado pelos favoritos.

```json
{ "indicadores": [ /* mesmo shape de DashboardItem, só os favoritados */ ] }
```

- 401: sem sessão.
- 200 com `indicadores: []`: nenhum favorito marcado ainda (frontend trata como estado vazio, não
  como erro).
