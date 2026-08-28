# Quickstart: Detalhe de série

## Pré-requisitos

Mesmos de `specs/001-dashboard/quickstart.md` (Postgres up, migrations, dado sincronizado).

## Validar API

```bash
npm run dev:api
curl http://localhost:3000/indicadores/usd-brl-ptax/serie | jq
```

Esperado: até 30 pontos (fx-diária), cada um com `dataReferencia`, `valor`, `variacao`, mais
`textoLimitacoes` não vazio.

## Validar Web

```bash
npm run dev:web
```

Navegar do Dashboard para o Detalhe de um indicador — verificar: tabela com pontos da janela;
texto de limitações visível sem ação extra; disclaimer herdado do Dashboard presente.

## Validar consistência com Dashboard

Para o indicador e `dataReferencia` mais recente, comparar `variacao` retornada aqui com a
retornada por `GET /indicadores` (specs/001-dashboard) — devem ser idênticas.
