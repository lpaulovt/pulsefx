# Research: Detalhe de série

Stack transversal já fixada (ver `specs/004-sincronizacao/research.md`). Regra de variação e
entidades canônicas (`Indicador`, `VariacaoService`) já decididas em
[specs/001-dashboard/research.md](../001-dashboard/research.md) e
[specs/001-dashboard/data-model.md](../001-dashboard/data-model.md) — reaproveitadas aqui, não
redecididas.

## Janela de histórico como query

- **Decision**: query única com `ORDER BY data_referencia DESC LIMIT N` (N = 30 para fx-diária, 12
  para macro-mensal), depois reverter ordem na Application para exibição cronológica.
- **Rationale**: mais simples que calcular um intervalo de datas fixo (ex.: "hoje - 30 dias") e
  depois filtrar — janela é sobre observações persistidas, não sobre calendário (vision §5.1),
  então `LIMIT N` já expressa exatamente essa regra sem lógica extra de datas.
- **Alternatives considered**: `WHERE data_referencia >= hoje - interval '30 days'` — erra a regra
  para macro-mensal (30 dias não cobre 12 meses) e teria que ser condicional por tipo de série de
  qualquer forma; `LIMIT N` já é condicional por tipo de série via lookup na tabela `indicador`.

## Texto de limitações dos dados

- **Decision**: conteúdo estático por indicador (não gerado dinamicamente), armazenado como
  constante no domínio (`domain/indicador/limitacoes.ts`), chaveado por `tipo_serie` + `fonte`.
- **Rationale**: o texto (seção 5.2 da vision) é o mesmo para todo indicador do mesmo tipo/fonte —
  não há necessidade de campo no banco nem de CMS; é conteúdo versionado com o código, revisável
  em PR como qualquer copy.
- **Alternatives considered**: campo em `indicador` no banco — adicionaria complexidade de
  migration/seed para um texto que muda por deploy de código, não por dado runtime.
