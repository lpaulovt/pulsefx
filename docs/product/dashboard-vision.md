# Dashboard

## 1. Problema

Usuário-alvo (quem acompanha câmbio/macro para decisão informada do dia a dia — importador/
exportador, investidor pessoa física, curioso econômico) precisa, em uma única tela, responder
"onde estão os indicadores que acompanho agora, e se moveram muito desde a última vez que olhei"
— sem precisar abrir 4 fontes diferentes (BCB, FRED) nem calcular variação de cabeça.

Evidência: `readme.md` seção 4.1 fixa o requisito ("cards com nome do indicador, último valor,
data de referência, variação percentual"); seção 3 exige que o candidato escolha e justifique o
conjunto de indicadores (ver `docs/product/pdr-selecao-indicadores.md` — USD/BRL PTAX, Meta
Selic, IPCA, FEDFUNDS).

## 2. Objetivo e Métricas de Sucesso

- **Objetivo de negócio:** dar visão consolidada e correta do estado atual de cada indicador
  escolhido, em uma tela só, sem exigir que o usuário interprete dado bruto de API.
- **Métrica principal:** todo indicador do conjunto (PDR) aparece no dashboard com valor, data de
  referência e variação % consistentes com a mesma regra usada na tela de Detalhe (seção 5 do
  readme — nenhuma divergência entre as duas telas).
- **Métricas de guardrail:**
  - dashboard nunca dispara chamada direta às APIs externas (BCB/FRED) no request do usuário —
    consumo é sempre do dado já sincronizado (ver `sincronizacao-vision.md`);
  - nenhum card exibe valor sem data de referência visível;
  - nenhum card "inventa" variação quando não há dado suficiente (mostra estado explícito de
    indisponibilidade, nunca 0% ou traço silencioso que pareça dado real).

## 3. Personas / Usuários-alvo

- **Importador/exportador:** olha o card de USD/BRL todo dia antes de decidir se converte agora ou
  espera; quer saber "subiu ou caiu desde ontem, e quanto".
- **Investidor pessoa física:** cruza câmbio com Selic/FEDFUNDS para entender diferencial de juros
  e se faz sentido migrar posição BRL/USD.
- **Curioso econômico:** quer entender IPCA/Selic do mês sem ler nota técnica do BCB.

Job-to-be-done comum: "me dê o estado atual de cada indicador que acompanho e me diga se mudou
significativamente, em 5 segundos, sem eu ter que calcular nada".

## 4. Escopo

### Dentro do escopo (in)

- Um card por indicador do conjunto fechado no PDR (USD/BRL PTAX, Meta Selic, IPCA, FEDFUNDS),
  mostrando: nome do indicador, último valor válido persistido, data de referência da observação,
  variação % (regra da seção 5 abaixo).
- Estado explícito de card quando não há variação calculável (ex.: indicador recém-adicionado,
  sem histórico suficiente para o N definido) — mensagem clara, não valor fabricado.
- Disclaimer visível na tela (ver seção 5.3 abaixo) — Dashboard é a tela de entrada do produto,
  então é onde o disclaimer precisa aparecer primeiro; Detalhe e Favoritos repetem/herdam o mesmo
  aviso (ver `detalhe-serie-vision.md` e `favoritos-vision.md`, que fazem referência a esta seção
  em vez de duplicar o texto).
- Indicação visível de que o dado vem de sincronização (não é "tempo real") — data de referência
  cumpre esse papel, sem exigir um relógio/contador técnico nesta tela (isso é detalhe de UI, não
  de produto).

### Fora do escopo (out)

- Gráfico ou série histórica no card do dashboard — isso é da tela de Detalhe (seção 4.2 do
  readme).
- Marcar/desmarcar favorito a partir do próprio card do dashboard como requisito obrigatório desta
  spec — favoritar é comportamento de "Meus indicadores" (`favoritos-vision.md`); se o dashboard
  também expuser esse controle, é decisão de UI do arquiteto/implementação, não requisito de
  produto desta feature.
- Trading, ordem, conversão de fato dentro do produto (seção 8 do readme — fora de escopo do MVP
  inteiro).
- Filtro, busca, ordenação customizável de cards — não citado no readme, não é dor relatada do
  usuário-alvo nesta rodada; especular isso agora é scope creep.

### Não-objetivos (non-goals)

- Não é um terminal de trading nem alerta em tempo real — é leitura de estado já sincronizado.
- Não é personalização de layout (drag-and-drop de cards, temas) — fora do MVP.

## 5. Requisitos de alto nível

### 5.1 Funcionais

- O sistema deve exibir, para cada indicador do conjunto fechado (PDR), um card com: nome,
  último valor, data de referência, variação %.
- "Último valor" = observação mais recente **válida já persistida** pelo backend, nunca uma
  chamada direta à fonte externa no momento do acesso do usuário (alinhado à política de sync).
- "Data de referência" = data da observação em si (ex.: dia do fechamento PTAX, mês de referência
  do IPCA) — nunca a data/hora em que o backend fez a última sincronização.
- Cada card deve deixar claro, na própria tela, se o indicador é de natureza diária (fx-diária) ou
  mensal (macro-mensal) — o usuário precisa entender por que a Selic pode "não ter mudado este
  mês" sem achar que é erro do sistema.

### 5.2 Regra de variação percentual (compartilhada entre Dashboard e Detalhe)

Esta é a regra canônica exigida pela seção 5 do readme. `detalhe-serie-vision.md` referencia esta
seção em vez de redefinir a regra — mesma regra nas duas telas é critério de aceite explícito.

**Denominador e janela, por tipo de série:**

| Tipo de série | Indicadores do MVP | Janela (N) | Comparação |
|---|---|---|---|
| **fx-diária** | USD/BRL PTAX | **N = 1 observação diária anterior** (D-1 útil) | último valor persistido vs. a observação persistida imediatamente anterior a ele |
| **macro-mensal** | Meta Selic, IPCA, FEDFUNDS | **N = 1 observação mensal anterior** (mês civil anterior com dado publicado) | último valor persistido vs. a observação persistida imediatamente anterior a ele |

Justificativa do N escolhido:
- **N=1 dia útil para fx-diária:** é a pergunta natural de quem abre o dashboard de manhã ("subiu
  ou caiu desde o último fechamento?"). Janelas maiores (5 dias, 30 dias) não são citadas como
  necessidade do usuário-alvo nesta rodada e podem ser adicionadas depois sem quebrar a regra
  atual (card mostraria "variação D-1" e, futuramente, um seletor de janela — fora de escopo
  agora).
- **N=1 mês para macro-mensal:** é a convenção que a própria fonte usa para publicar IPCA
  (variação mês a mês) — manter a mesma leitura evita o usuário ter que "reinterpretar" o número.
  Para a Selic (que só muda em reunião do Copom), aplicar a mesma regra de "mês anterior
  disponível" é intencional: meses sem mudança de meta mostram variação 0,00 p.p., que é
  informação real (juro estável), não indisponibilidade de dado.

**Cálculo:** `variação % = (valor_atual - valor_anterior) / valor_anterior`, expresso em %. Para
Selic (série em pontos percentuais, não índice), a variação exibida é a diferença absoluta em
pontos percentuais (p.p.), rotulada como tal — não uma variação percentual do valor percentual
(evita o erro clássico de "variação % de uma taxa", que confunde mais do que esclarece o usuário).

**Tratamento de calendário (fins de semana / feriados / lacunas):**
- A janela **nunca conta dias/meses de calendário "furados"** — conta observações efetivamente
  persistidas. Ou seja, "N=1 observação anterior" pula automaticamente fins de semana, feriados e
  qualquer dia sem publicação da fonte, porque esses dias simplesmente não geram observação
  persistida.
- Não há interpolação de valor ausente (alinhado à recomendação do readme seção 5 — mercado
  financeiro não deve ser interpolado). Se a fonte não publicou o dado esperado por instabilidade
  (não por calendário normal), o card deve indicar explicitamente que o dado é o último conhecido
  e há atraso, em vez de calcular variação contra um valor artificial.
- Selic e IPCA, por natureza, têm gaps de calendário maiores que dias úteis comuns (Selic muda a
  cada ~45 dias, IPCA é mensal) — isso é esperado e não deve disparar o mesmo aviso de "possível
  instabilidade da fonte" que um gap inesperado em série diária dispararia.

### 5.3 Disclaimer (decisão de onde viver)

Decisão: **não criar um `disclaimer-vision.md` próprio.** O disclaimer ("informação educacional;
não é recomendação de investimento" — readme seção 4.5) não é uma funcionalidade com
tela/dado/persona própria — é um requisito transversal de confiança que se aplica a qualquer tela
que mostre valor/variação de indicador (Dashboard, Detalhe, Favoritos). Um vision doc dedicado
para uma frase de aviso duplicaria estrutura (problema/persona/métricas) sem conteúdo novo.
Tratamento: definido aqui (Dashboard, tela de entrada) como requisito canônico; `detalhe-serie-
vision.md` e `favoritos-vision.md` referenciam esta seção.

- Requisito funcional: o aviso deve estar **visível sem ação do usuário** (não atrás de tooltip,
  modal que exige clique, ou rodapé que exige scroll) em qualquer tela que exiba valor/variação de
  indicador.
- Conteúdo mínimo: deixar explícito que os dados são para fins educacionais/informativos e não
  constituem recomendação de investimento — sem prometer precisão, atualização em tempo real, ou
  aconselhamento financeiro.
- Fora de escopo: texto legal completo revisado por jurídico, tradução multi-idioma, versão
  específica por indicador.

### 5.4 Não-funcionais em nível de produto

- Todo card exibido deve ter data de referência visível — sem exceção, mesmo em estado de erro.
- Nenhuma tela deve fazer o usuário acreditar que o valor é "ao vivo" — a data de referência e o
  enquadramento de sincronização (seção 5.1) cumprem esse papel.

## 6. Restrições e premissas

- Fonte de verdade dos indicadores e regra de variação é este documento + PDR — não redecidir
  aqui stack, schema ou camada (arquitetura é do `fullstack-architect`).
- **Premissa não confirmada nesta rodada** (registrar como incerteza, não fato): rate limit
  explícito e termos de uso completos de BCB (Olinda retornou HTTP 403 na tentativa de leitura
  automatizada) e limite de requisições/minuto do FRED. A política de sync (`sincronizacao-
  vision.md`) deve assumir cenário conservador até confirmação.
- Dado exibido está sempre sujeito à política de sincronização — dashboard não é fonte de verdade
  de "agora", é fonte de verdade do "último dado sincronizado".

## 7. Riscos e dependências

- Depende de `sincronizacao-vision.md` estar implementada corretamente — se a sincronização
  falhar silenciosamente, o dashboard mostraria dado desatualizado sem indicar isso, quebrando a
  métrica de guardrail de "nunca fabricar variação/estado".
- Risco de a fonte (BCB/FRED) mudar formato/disponibilidade de série sem aviso — mitigação de
  produto é o texto de "limitações dos dados" (tela de Detalhe), não algo que o Dashboard resolve
  sozinho.
- Selic com variação 0 p.p. recorrente pode ser mal interpretada por quem avalia o MVP sem ler
  esta documentação — mitigado por rotular explicitamente "p.p." e não "%": ver seção 5.2.

## 8. Critérios de aceite macro

- Os 4 indicadores do PDR aparecem no dashboard, cada um com nome, último valor, data de
  referência e variação, sem exceção.
- Variação exibida no dashboard é idêntica (mesmo valor, mesmo sinal, mesma unidade) à exibida na
  tela de Detalhe para o mesmo indicador e mesma data de referência.
- Disclaimer visível na tela sem exigir ação do usuário.
- Nenhum card exibe variação calculada quando não há observação anterior suficiente — mostra
  estado explícito em vez disso.
- Nenhuma chamada às APIs externas (BCB/FRED) é disparada pelo carregamento do dashboard por um
  usuário — apenas leitura de dado já persistido.

## 9. Abertos / decisões pendentes

- Confirmar, antes de fixar TTL/job de sync (fora do escopo deste doc, ver
  `sincronizacao-vision.md`), o rate limit real de BCB Olinda/SGS e do FRED — não confirmado nesta
  rodada por falha de acesso automatizado (HTTP 403 no Swagger do Olinda) e ausência do dado nas
  seções indexadas da doc do FRED.
- Confirmar texto exato exigido pelos Termos de Uso do FRED para atribuição de fonte
  (`fred.stlouisfed.org/docs/api/terms_of_use.html` não lido por completo nesta rodada) antes de
  finalizar copy do disclaimer/rodapé.
- Se o dashboard também expõe o controle de favoritar diretamente no card (vs. só na tela de
  "Meus indicadores"), é decisão de UI a ser tomada na Fase 2/arquitetura — não bloqueia esta
  vision.
