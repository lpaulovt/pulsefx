# Contract: GET /indicadores

## Request

```
GET /indicadores
```

Sem parâmetros — sempre retorna o conjunto fechado do MVP.

## Response 200

```json
{
  "indicadores": [
    {
      "indicadorId": "usd-brl-ptax",
      "nome": "USD/BRL (PTAX)",
      "tipoSerie": "fx-diaria",
      "ultimoValor": 5.32,
      "dataReferencia": "2026-08-27",
      "variacao": { "tipo": "calculada", "valor": 0.38, "unidade": "percentual", "sinal": "+" }
    },
    {
      "indicadorId": "meta-selic",
      "nome": "Meta Selic",
      "tipoSerie": "macro-mensal",
      "ultimoValor": 10.75,
      "dataReferencia": "2026-08-01",
      "variacao": { "tipo": "calculada", "valor": 0, "unidade": "pontos-percentuais", "sinal": "0" }
    },
    {
      "indicadorId": "ipca",
      "nome": "IPCA",
      "tipoSerie": "macro-mensal",
      "ultimoValor": null,
      "dataReferencia": null,
      "variacao": { "tipo": "indisponivel", "motivo": "sem_observacao" }
    }
  ]
}
```

## Regras

- NUNCA dispara chamada a BCB/FRED (FR-009) — leitura pura de `indicador` + `observacao`.
- Sempre retorna os 4 indicadores do conjunto fechado, mesmo sem observação (`ultimoValor: null`,
  `variacao.tipo: "indisponivel"`).
- `variacao` nunca é `{ tipo: "calculada", valor: 0 }` fabricado — `0` só aparece quando há de
  fato duas observações comparadas e o resultado é zero (ex.: Selic sem mudança no mês).
