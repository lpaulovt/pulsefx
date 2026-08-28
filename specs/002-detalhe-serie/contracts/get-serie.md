# Contract: GET /indicadores/:id/serie

## Request

```
GET /indicadores/usd-brl-ptax/serie
```

## Response 200

```json
{
  "indicadorId": "usd-brl-ptax",
  "tipoSerie": "fx-diaria",
  "janelaSolicitada": 30,
  "historicoCompleto": true,
  "pontos": [
    { "dataReferencia": "2026-07-15", "valor": 5.28, "variacao": { "tipo": "indisponivel", "motivo": "sem_observacao" } },
    { "dataReferencia": "2026-07-16", "valor": 5.30, "variacao": { "tipo": "calculada", "valor": 0.38, "unidade": "percentual", "sinal": "+" } }
  ],
  "textoLimitacoes": "Dado publicado pelo BCB (SGS)... [ver domain/indicador/limitacoes.ts]"
}
```

## Response 404

```json
{ "error": "indicador_nao_encontrado" }
```

## Regras

- `pontos` ordenado cronologicamente (mais antigo primeiro).
- `variacao` de cada ponto segue a mesma regra/serviço usado no Dashboard (FR-005/FR-006 do
  spec.md desta feature) — nunca redefinida aqui.
- `historicoCompleto: false` quando `pontos.length < janelaSolicitada` — frontend deve exibir aviso
  de "histórico ainda sendo formado" (FR-003).
