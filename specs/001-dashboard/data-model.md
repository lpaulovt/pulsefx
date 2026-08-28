# Data Model: Dashboard

Entidades canônicas do módulo `indicador` — compartilhadas por Dashboard e Detalhe (specs 001 e
002). `Observacao` é definida e populada pelo módulo `sincronizacao`
([specs/004-sincronizacao/data-model.md](../004-sincronizacao/data-model.md)); aqui ela é apenas
consumida.

## Indicador

| Campo | Tipo | Regra |
|---|---|---|
| `id` | text (slug) | PK, ex.: `usd-brl-ptax`, `meta-selic`, `ipca`, `fed-funds` |
| `nome` | text | nome de exibição |
| `tipo_serie` | enum `fx-diaria` \| `macro-mensal` | define regra de variação e janela (FR-004, FR-005) |
| `fonte` | enum `bcb` \| `fred` | apenas informativo/rastreio, não afeta regra de negócio |
| `unidade` | enum `percentual` \| `pontos-percentuais` | Selic usa `pontos-percentuais` (seção 5.2 da vision) |

Conjunto fechado nesta rodada do MVP (seed via migration, não CRUD de usuário) — ver
`docs/product/pdr-selecao-indicadores.md`.

## VariacaoResult (value object, não persistido)

União discriminada retornada pelo `VariacaoService` (ver `research.md`):

```ts
type VariacaoResult =
  | { tipo: "calculada"; valor: number; unidade: "percentual" | "pontos-percentuais"; sinal: "+" | "-" | "0" }
  | { tipo: "indisponivel"; motivo: "historico_insuficiente" | "sem_observacao" };
```

## DashboardItem (DTO de saída do caso de uso, espelha o contrato HTTP)

| Campo | Tipo |
|---|---|
| `indicadorId` | string |
| `nome` | string |
| `tipoSerie` | `fx-diaria` \| `macro-mensal` |
| `ultimoValor` | number \| null (null apenas se não houver nenhuma observação) |
| `dataReferencia` | string (ISO date) \| null |
| `variacao` | `VariacaoResult` |
