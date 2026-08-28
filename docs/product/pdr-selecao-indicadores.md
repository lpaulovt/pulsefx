# PDR — Seleção do conjunto de indicadores do MVP

## Contexto

`readme.md` (seção 3) exige integrar dados de no mínimo duas fontes distintas, incluindo
obrigatoriamente BCB e FRED, e deixa a escolha do conjunto concreto de indicadores a cargo do
candidato — com exigência de ler a documentação oficial vigente de cada fonte e justificar cada
indicador em 2-5 linhas para o usuário-alvo (quem acompanha câmbio/macro para decisão informada
do dia a dia).

Validação de fonte feita nesta rodada via `ctx_fetch_and_index`/busca web (28/08/2026):

- **BCB SGS** (`https://api.bcb.gov.br/dados/serie/bcdata.sgs.<codigo>/dados/...?formato=json`):
  API pública, sem chave, retorna JSON `[{"data": "DD/MM/AAAA", "valor": "..."}]`. Confirmado por
  chamada real:
  - série **1** = Dólar americano (venda) — câmbio comercial diário (PTAX), dado só em dia útil.
  - série **432** = Meta Selic definida pelo Copom (% a.a.) — muda apenas em reunião do Copom
    (ciclo ~45 dias), não diariamente.
  - série **433** = IPCA — variação % mensal — um valor por mês, data de referência é o 1º dia
    do mês de referência.
  - Metodologia PTAX confirmada em `dadosabertos.bcb.gov.br` (dataset "Dólar comercial — cotações
    diárias"): desde jul/2011 a PTAX de fechamento é a média aritmética dos boletins do dia.
  - **Não confirmado nesta rodada** (Olinda/PTAX swagger retornou HTTP 403 ao fetch automatizado,
    e a página de termos de uso do Dados Abertos não foi lida por completo): rate limit explícito
    de chamadas e texto exato de termos de uso do BCB. Tratado como premissa em cada vision doc,
    não como fato — recomenda-se ao `fullstack-architect` reconfirmar antes de fixar TTL de sync.
- **FRED** (`fred/series/observations`, docs em `fred.stlouisfed.org/docs/api/fred/`): API
  exige `api_key` (string alfanumérica de 32 caracteres, obrigatória) e tem página própria de
  Termos de Uso (`/docs/api/terms_of_use.html`, não lida por completo nesta rodada — tratar
  exigência de atribuição de fonte como premissa a confirmar antes de shippar o texto de
  disclaimer/rodapé). Série `FEDFUNDS` confirmada: Federal Funds Effective Rate, mensal, %, não
  ajustada sazonalmente, fonte Fed H.15, atualizada mensalmente.
  - **Não confirmado nesta rodada**: limite exato de requisições/minuto do FRED (não apareceu no
    conteúdo indexado da doc geral). Tratado como premissa — política de sync (TTL) deve assumir
    limite conservador até confirmação.

## Problema

Sem um conjunto de indicadores concreto e justificado, Dashboard/Detalhe/Favoritos/Sincronização
não têm o que exibir nem um caso de teste real para a regra de variação (seção 5 do readme, que
exige tratar fx-diária e macro-mensal de forma diferente). Escolha arbitrária ("porque a API
existe") não atende à exigência do briefing de justificar por que cada indicador importa pro
usuário.

## Alternativas consideradas

1. **Só câmbio (PTAX) + 1 série FRED avulsa (ex. preço de commodity)** — mínimo possível para
   cumprir "2 fontes". Rejeitada: não gera nenhuma narrativa coerente pro usuário (câmbio +
   indicador sem relação econômica direta), dashboard vira lista solta de números.
2. **Cesta ampla (6+ indicadores: câmbio, Selic, IPCA, PIB, desemprego, FEDFUNDS, CPI, DXY)** —
   rejeitada por ponytail/YAGNI: MVP de processo seletivo, mais indicadores = mais código de
   normalização/mapeamento por fonte sem aumento de sinal de avaliação; risco de diluir qualidade
   por quantidade.
3. **Conjunto coerente mínimo: PTAX (BCB, fx-diária) + Selic meta (BCB, macro-mensal) + IPCA
   (BCB, macro-mensal) + FEDFUNDS (FRED, macro-mensal)** — **escolhida**.

## Indicadores escolhidos e justificativa

| # | Indicador | Fonte / série | Tipo de série |
|---|-----------|----------------|---------------|
| 1 | USD/BRL — Dólar americano (venda), câmbio PTAX | BCB SGS série 1 | fx-diária |
| 2 | Meta Selic (Copom) | BCB SGS série 432 | macro-mensal |
| 3 | IPCA — variação mensal | BCB SGS série 433 | macro-mensal |
| 4 | Federal Funds Effective Rate | FRED `FEDFUNDS` | macro-mensal |

1. **USD/BRL (PTAX venda):** é o preço que o usuário-alvo (importador/exportador, investidor
   pessoa física, curioso econômico) checa todo dia para decidir quando converter ou não converter
   reais/dólares — é o indicador com maior frequência de consulta e o único que justifica, por si
   só, a regra "fx-diária" do MVP.
2. **Meta Selic:** âncora da taxa de juros doméstica; explica por que capital estrangeiro entra ou
   sai do Brasil (carry trade) e por que o BRL se aprecia/deprecia — contexto que o usuário precisa
   para interpretar o movimento do câmbio, não só vê-lo. Bônus técnico: como só muda em reuniões do
   Copom, é um caso real de série "macro-mensal com lacunas" (variação pode dar 0 em vários meses
   seguidos) — testa a robustez da regra de variação sem inventar dado.
3. **IPCA mensal:** termômetro de inflação doméstica; junto com a Selic, dá ao usuário o quadro de
   juro real, que é o principal driver de médio prazo do câmbio e de decisão de poupar em BRL vs
   USD.
4. **Federal Funds Effective Rate (FRED):** lado americano do diferencial de juros que move o BRL;
   sem um indicador americano, o dashboard só contaria a história doméstica. Escolhido em vez de
   índice de preço/commodity avulso porque fecha o par narrativo com a Selic (diferencial de juros
   Brasil x EUA), que é justamente o que o usuário-alvo de câmbio acompanha.

## Impacto esperado no valor pro usuário / avaliação do MVP

- Dashboard conta uma história coerente (câmbio + juros doméstico + inflação doméstica + juros
  americano), não uma lista arbitrária de métricas.
- Cobre as duas classificações de série exigidas pelo readme (fx-diária e macro-mensal) com casos
  realistas, incluindo uma série macro com cadência irregular (Selic), que é o teste mais honesto
  da regra "N meses anteriores com dado disponível, sem inventar dado".
- Escopo pequeno (4 indicadores, 2 fontes) reduz superfície de normalização/erro sem sacrificar
  a exigência de "conjunto coerente".

## Custo de oportunidade

Não incluir PIB, desemprego, CPI americano, DXY ou séries opcionais (IPEADATA/World Bank) — aceito
porque nenhum desses é obrigatório (readme seção 3 lista como opcional) e cada indicador extra
adiciona normalização/teste sem mudar o veredito de "conjunto coerente mínimo cumprido".

## Decisão

Adotar os 4 indicadores acima como escopo fechado do MVP. Qualquer indicador adicional é fora de
escopo desta rodada e exige novo PDR.

## Trade-offs

- Menos "riqueza visual" no dashboard (4 cards) do que um conjunto maior — aceitável para MVP.
- Selic com variação frequentemente igual a 0 pode parecer "bug" para quem avalia sem ler a
  documentação — mitigado exigindo que `dashboard-vision.md`/`detalhe-serie-vision.md` documentem
  esse comportamento como esperado, não como falha.

## Riscos

- Rate limit e termos de uso exatos de BCB (Olinda) e FRED não confirmados nesta rodada (ver
  "Validação de fonte" acima) — risco de a política de sync precisar de ajuste após confirmação
  futura. Registrado também em "Abertos / decisões pendentes" dos vision docs.
- BCB pode alterar formato/disponibilidade da SGS sem aviso prévio (histórico já mostrado na
  documentação da fonte) — risco herdado, não mitigável em nível de produto além de expor
  "limitações dos dados" na tela de Detalhe.
