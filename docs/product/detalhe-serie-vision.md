# Detalhe de série

## 1. Problema

Depois de ver no Dashboard que um indicador "mudou", o usuário-alvo precisa entender **o
histórico** por trás daquele número — é uma mudança pontual ou uma tendência? — e precisa saber
até onde pode confiar naquele dado (a série tem lacuna? é revisada pela fonte depois de publicada?
é câmbio comercial ou PTAX oficial?). O Dashboard (card) não tem espaço nem é o lugar certo para
essa profundidade.

Evidência: `readme.md` seção 4.2 fixa o requisito ("série temporal — tabela ou gráfico simples,
janela de histórico por tipo de série, texto sobre limitações dos dados").

## 2. Objetivo e Métricas de Sucesso

- **Objetivo de negócio:** permitir que o usuário valide, com histórico, a leitura que teve no
  Dashboard, e entenda as limitações do dado antes de tomar uma decisão baseada nele.
- **Métrica principal:** para qualquer indicador do conjunto (PDR), a tela de Detalhe exibe
  histórico dentro da janela definida por tipo de série (seção 5 abaixo) e reproduz a mesma
  variação % mostrada no Dashboard para a mesma data de referência.
- **Métricas de guardrail:**
  - texto de limitações dos dados está sempre presente, nunca omitido por "não ter o que dizer";
  - nenhuma lacuna de calendário é preenchida com dado interpolado/fabricado na série exibida.

## 3. Personas / Usuários-alvo

Mesmas personas de `dashboard-vision.md` (seção 3) — a diferença é o momento de uso: Detalhe é
acessado **depois** do Dashboard, quando o usuário já notou algo (variação chamou atenção) e quer
confirmar antes de agir (ex.: converter câmbio, reavaliar posição).

## 4. Escopo

### Dentro do escopo (in)

- Série temporal do indicador selecionado, em tabela ou gráfico simples (qualquer um dos dois
  satisfaz o requisito do readme; escolha de qual usar é de UI/arquitetura, não de produto).
- Janela de histórico exibida por padrão, definida por tipo de série (seção 5.1 abaixo).
- Texto de limitações dos dados (seção 5.2 abaixo), específico o suficiente para o usuário separar
  "isso é confiável para decisão do dia a dia" de "isso pode mudar depois".
- Data de referência de cada observação exibida na série (não só do último valor).
- Reaproveitamento da regra de variação percentual definida em `dashboard-vision.md` §5.2 — esta
  tela não redefine a regra, apenas a aplica de forma consistente.
- Disclaimer visível (herdado de `dashboard-vision.md` §5.3 — mesmo requisito, sem redefinir
  texto aqui).

### Fora do escopo (out)

- Exportação de dado (CSV/PDF), zoom/pan avançado de gráfico, comparação lado a lado de dois
  indicadores na mesma tela — não citados no readme, não são dor relatada pelo usuário-alvo nesta
  rodada.
- Anotações do usuário sobre a série, alertas de limite/threshold — fora do MVP (seção 8 do
  readme trata explicitamente qualquer mecanismo de decisão de trade como fora de escopo; alerta
  de preço é adjacente a isso).
- Revisão histórica retroativa de valores já publicados pela fonte (ex.: BCB/IBGE às vezes
  republicam com ajuste) como funcionalidade de produto — ver risco na seção 7.

### Não-objetivos (non-goals)

- Não é uma ferramenta de análise técnica (médias móveis, indicadores derivados) — é leitura de
  histórico bruto com contexto.
- Não substitui a documentação oficial da fonte — o texto de limitações aponta para ela, não a
  recria.

## 5. Requisitos de alto nível

### 5.1 Janela de histórico por tipo de série

| Tipo de série | Indicadores | Janela de histórico padrão exibida | Justificativa |
|---|---|---|---|
| **fx-diária** | USD/BRL PTAX | **últimos 30 dias úteis com dado persistido** | cobre ~1 mês de pregões, suficiente para o usuário ver tendência de curto prazo sem rolar histórico irrelevante; consistente com o N=1 dia útil da regra de variação (a janela é um múltiplo confortável do N, não o próprio N). |
| **macro-mensal** | Meta Selic, IPCA, FEDFUNDS | **últimas 12 observações mensais persistidas** (~12 meses) | cobre um ciclo anual completo, permite ver o indicador atravessar diferentes fases de política monetária/inflação sem virar uma tela de "todo o histórico desde 1999". |

- A janela é sobre **observações persistidas**, não sobre intervalo de calendário fixo — mesma
  lógica de "sem inventar dado" da regra de variação (`dashboard-vision.md` §5.2).
- Se o indicador tiver menos observações persistidas do que a janela padrão (ex.: sincronização
  recém-iniciada), a tela mostra o que existe e indica explicitamente que o histórico ainda está
  sendo formado — nunca preenche com dado ausente.

### 5.2 Texto de limitações dos dados

Requisito funcional: cada tela de Detalhe deve exibir um texto (curto, mas específico ao
indicador/fonte) cobrindo, no mínimo:

- fonte oficial do dado (BCB SGS ou FRED) e que o valor é o publicado pela fonte, não recalculado
  pelo Pulse FX;
- que o dado é o último sincronizado pelo Pulse FX, podendo haver defasagem em relação à fonte
  (ligação direta com a política de sincronização — ver `sincronizacao-vision.md`);
- que a fonte pode revisar valores já publicados após a divulgação original (ex.: IPCA e Selic
  podem ter reclassificação/errata da fonte) e o Pulse FX reflete o valor mais recente conhecido,
  não necessariamente o "definitivo histórico";
- que não há interpolação de dado ausente (alinhado à seção 5 do readme).

Este texto **não é o mesmo disclaimer de investimento** (`dashboard-vision.md` §5.3) — são dois
avisos com propósito diferente (limitação técnica do dado vs. natureza educacional do produto) e
ambos devem aparecer na tela, sem se substituir um pelo outro.

### 5.3 Não-funcionais em nível de produto

- Toda observação exibida na série tem data de referência visível — nunca só o valor.
- Consistência obrigatória com o Dashboard: mesmo indicador, mesma data de referência ⇒ mesmo
  valor e mesma variação nas duas telas (critério de aceite compartilhado).

## 6. Restrições e premissas

- Não redecidir aqui regra de variação, indicadores ou fontes — herdados de
  `dashboard-vision.md` e do PDR.
- Premissa: frequência de revisão de dado histórico pela fonte (BCB/FRED) não foi mapeada em
  detalhe nesta rodada — texto de limitações trata isso de forma genérica até confirmação futura
  (ver seção 9).

## 7. Riscos e dependências

- Depende de `sincronizacao-vision.md` para a defasagem mencionada no texto de limitações ser
  verdadeira e não apenas um texto genérico descolado do comportamento real.
- Risco: se a fonte revisar um valor histórico já persistido (ex.: IPCA reprocessado), o Pulse FX
  pode exibir um valor diferente do que a fonte mostra "hoje" para aquela mesma data de
  referência, sem o usuário perceber que houve revisão — mitigação de produto é o texto de
  limitações alertar para isso; mitigação técnica (detectar e reprocessar) é decisão de
  arquitetura, fora deste documento.

## 8. Critérios de aceite macro

- Para cada indicador do PDR, a tela de Detalhe exibe histórico dentro da janela definida por tipo
  de série (30 dias úteis para fx-diária, 12 meses para macro-mensal), sem dado interpolado.
- Texto de limitações dos dados está presente e cobre, no mínimo, os 4 pontos da seção 5.2.
- Disclaimer educacional (herdado do Dashboard) está visível na tela.
- Variação % exibida no Detalhe é idêntica à do Dashboard para o mesmo indicador/data de
  referência.

## 9. Abertos / decisões pendentes

- Confirmar política real de revisão histórica de cada fonte (BCB SGS, FRED) para tornar o texto
  de limitações mais específico por indicador em vez de genérico — não verificado nesta rodada.
- Definir se a janela de histórico é ajustável pelo usuário (seletor 30/90/365 dias) — não exigido
  pelo readme; tratado aqui como fixo por tipo de série para MVP; extensão futura não bloqueia
  esta vision.
