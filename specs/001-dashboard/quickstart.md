# Quickstart: Dashboard

## Pré-requisitos

- `docker-compose up -d postgres`
- Migrations rodadas (`npm run migrate -w apps/api`)
- Ao menos uma sincronização executada (`specs/004-sincronizacao/quickstart.md`) — ou seed manual
  de `observacao` para teste local sem esperar o job.

## Validar API

```bash
npm run dev:api
curl http://localhost:3000/indicadores | jq
```

Esperado: array com os 4 indicadores do PDR, cada um com `nome`, `tipoSerie`, `ultimoValor`,
`dataReferencia`, `variacao`.

## Validar Web

```bash
npm run dev:web
```

Abrir `http://localhost:5173` — verificar: 4 cards visíveis; disclaimer visível sem scroll/clique;
indicador sem observação suficiente mostra estado explícito (não "0%").

## Validar consistência com Detalhe

Comparar `variacao` retornada por `GET /indicadores` com a retornada por
`GET /indicadores/:id/serie` (specs/002-detalhe-serie) para o mesmo `indicadorId` e mesma
`dataReferencia` — devem ser idênticas (FR-006).
