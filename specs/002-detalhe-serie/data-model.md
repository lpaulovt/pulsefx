# Data Model: Detalhe de série

Reaproveita `Indicador`, `Observacao`, `VariacaoResult`
([specs/001-dashboard/data-model.md](../001-dashboard/data-model.md)). Sem entidade nova
persistida.

## SerieItem (ponto da série, DTO)

| Campo | Tipo |
|---|---|
| `dataReferencia` | string (ISO date) |
| `valor` | number |
| `variacao` | `VariacaoResult` (comparado ao ponto anterior da série) |

## SerieResponse (DTO de saída do endpoint)

| Campo | Tipo |
|---|---|
| `indicadorId` | string |
| `tipoSerie` | `fx-diaria` \| `macro-mensal` |
| `janelaSolicitada` | number (30 ou 12) |
| `pontos` | `SerieItem[]` (pode ter menos itens que `janelaSolicitada` — histórico em formação) |
| `historicoCompleto` | boolean (`false` quando `pontos.length < janelaSolicitada`) |
| `textoLimitacoes` | string (conteúdo estático por `tipoSerie`/`fonte`, ver `research.md`) |
