---
feature: dashboard
status: draft
tipo_serie: mista # dashboard exibe fx-diária (PTAX) e macro-mensal (Selic, IPCA, FEDFUNDS) lado a lado
fontes: [bcb, fred]
metricas:
  - nome: consistência de variação entre Dashboard e Detalhe
    baseline: desconhecido (feature nova)
    alvo: 100% dos indicadores com mesmo valor/sinal/unidade nas duas telas
personas: [importador-exportador, investidor-pessoa-fisica, curioso-economico]
depende_de: [sincronizacao, pdr-selecao-indicadores]
versao: 1
---

# Feature Specification: Dashboard

**Feature Branch**: `001-dashboard`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Dashboard de câmbio e indicadores macro, conforme docs/product/dashboard-vision.md"

## Referência

- Doc macro: [docs/product/dashboard-vision.md](../../docs/product/dashboard-vision.md)
- readme.md: seções 4.1 (Dashboard), 5 (variação percentual), 8 (fora de escopo)
- PDR: [docs/product/pdr-selecao-indicadores.md](../../docs/product/pdr-selecao-indicadores.md)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver estado atual de todos indicadores acompanhados (Priority: P1)

Usuário abre o dashboard e vê, em uma única tela, um card por indicador do conjunto fechado
(USD/BRL PTAX, Meta Selic, IPCA, FEDFUNDS) com nome, último valor, data de referência e variação.

**Why this priority**: é o job-to-be-done central do produto — sem isso não há MVP. Todas as
personas (importador/exportador, investidor pessoa física, curioso econômico) dependem desta tela
como ponto de entrada.

**Independent Test**: com dado já sincronizado no backend, carregar o dashboard e verificar que os
4 indicadores aparecem, cada um com os 4 campos exigidos.

**Acceptance Scenarios**:

1. **Given** os 4 indicadores do PDR têm ao menos uma observação persistida, **When** usuário abre
   o dashboard, **Then** cada indicador aparece em um card com nome, último valor, data de
   referência e variação (% ou p.p., conforme seção 5.2 da vision).
2. **Given** um indicador é fx-diária (PTAX) e outro é macro-mensal (Selic/IPCA/FEDFUNDS),
   **When** usuário olha os cards, **Then** cada card deixa claro sua natureza (diária vs mensal),
   sem que o usuário confunda "sem mudança este mês" com erro do sistema.

---

### User Story 2 - Entender quando não há variação calculável (Priority: P2)

Usuário vê um indicador recém-adicionado ou sem histórico suficiente e o card mostra estado
explícito de indisponibilidade, nunca um valor fabricado (0% ou traço silencioso).

**Why this priority**: métrica de guardrail explícita da vision — evita que usuário tome decisão
sobre dado incorreto/inventado. Sem isso o produto perde credibilidade (persona
investidor/importador toma decisão real com esse número).

**Independent Test**: com um indicador tendo apenas uma observação persistida (sem anterior para
comparar), carregar o dashboard e verificar que o card mostra mensagem explícita, não "0%".

**Acceptance Scenarios**:

1. **Given** um indicador tem apenas uma observação persistida, **When** usuário abre o dashboard,
   **Then** o card exibe estado explícito de "sem variação calculável ainda", nunca 0% ou traço.
2. **Given** a fonte externa não publicou o dado esperado por instabilidade (não por calendário
   normal — fim de semana/feriado), **When** usuário abre o dashboard, **Then** o card indica que
   o dado é o último conhecido e há atraso.

---

### User Story 3 - Ver disclaimer sem precisar procurar (Priority: P3)

Usuário vê, assim que abre o dashboard, aviso de que os dados são educacionais/informativos e não
constituem recomendação de investimento — sem precisar clicar em nada.

**Why this priority**: requisito de confiança transversal (readme seção 4.5) e, por ser o
dashboard a tela de entrada do produto, é onde esse aviso precisa aparecer primeiro (Detalhe e
Favoritos herdam o mesmo texto, não duplicam).

**Independent Test**: carregar o dashboard sem interação nenhuma do usuário e verificar que o
disclaimer está visível na renderização inicial.

**Acceptance Scenarios**:

1. **Given** usuário abre o dashboard pela primeira vez, **When** a tela carrega, **Then** o
   disclaimer está visível sem exigir clique, hover ou scroll.

---

### Edge Cases

- Indicador com dado desatualizado por falha silenciosa de sincronização: dashboard não deve
  "esconder" o problema — deve mostrar a data de referência real (antiga) em vez de sugerir que o
  dado é atual (ver User Story 2, cenário de atraso).
- Selic (ou outro indicador macro-mensal) sem mudança de valor no mês: variação deve aparecer como
  `0,00 p.p.`, rotulada como pontos percentuais, não como "0%" nem como indisponibilidade — é
  informação real (juro estável), não falta de dado.
- Todos os 4 indicadores sem nenhuma observação persistida ainda (primeira carga do sistema,
  sincronização não rodou): dashboard deve mostrar estado de indisponibilidade por indicador, sem
  erro genérico que quebre a tela inteira.
- Requisição do dashboard não deve, em nenhuma circunstância, disparar chamada direta a BCB/FRED —
  mesmo se o dado estiver ausente ou desatualizado (contrato com a política de sincronização).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE exibir um card por indicador do conjunto fechado do MVP (USD/BRL PTAX,
  Meta Selic, IPCA, FEDFUNDS), cada um com: nome do indicador, último valor, data de referência,
  variação.
- **FR-002**: "Último valor" exibido DEVE ser a observação mais recente válida já persistida pelo
  backend — nunca resultado de chamada direta à fonte externa disparada pelo acesso do usuário.
- **FR-003**: "Data de referência" exibida DEVE ser a data da observação em si (ex.: dia do
  fechamento PTAX, mês de referência do IPCA), nunca a data/hora da última sincronização do
  backend.
- **FR-004**: Cada card DEVE indicar se o indicador é de natureza diária (fx-diária) ou mensal
  (macro-mensal).
- **FR-005**: Variação exibida DEVE seguir a regra canônica (seção 5.2 da vision / seção 5 do
  readme.md): fx-diária compara com N=1 observação diária anterior (D-1 útil); macro-mensal
  compara com N=1 observação mensal anterior; janela conta apenas observações efetivamente
  persistidas, nunca dias/meses de calendário "furados"; Selic é exibida em pontos percentuais
  (p.p.), não em variação percentual do valor percentual.
- **FR-006**: Variação exibida no dashboard DEVE ser idêntica (mesmo valor, sinal e unidade) à
  exibida na tela de Detalhe para o mesmo indicador e mesma data de referência.
- **FR-007**: Quando não houver observação anterior suficiente para calcular variação, sistema
  DEVE exibir estado explícito de indisponibilidade — nunca 0% ou traço fabricado.
- **FR-008**: Sistema DEVE exibir disclaimer visível sem exigir ação do usuário (não atrás de
  tooltip, modal ou rodapé que exija scroll), com conteúdo mínimo de aviso educacional/informativo,
  sem prometer precisão ou tempo real.
- **FR-009**: Carregamento do dashboard por um usuário NUNCA DEVE disparar chamada direta às APIs
  externas (BCB/FRED) — consome exclusivamente dado já persistido.
- **FR-010**: Sempre que existir ao menos uma observação persistida para um indicador, o card
  DEVE exibir sua data de referência visível — inclusive quando o dado estiver desatualizado (não
  deve "esconder" a data antiga para parecer atual). Quando não existir nenhuma observação
  persistida (indicador ainda não sincronizado), o card exibe o estado explícito de
  indisponibilidade (FR-007) sem data de referência, por não haver nenhuma a exibir.

### Key Entities *(include if feature involves data)*

- **Indicador**: representa um item do conjunto fechado do MVP (USD/BRL PTAX, Meta Selic, IPCA,
  FEDFUNDS). Atributos relevantes ao dashboard: nome, tipo de série (fx-diária | macro-mensal),
  fonte de origem (BCB | FRED).
- **Observação**: valor persistido de um indicador em uma data de referência específica. O
  dashboard consome sempre a observação mais recente válida e, quando existir, a imediatamente
  anterior (para cálculo de variação).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 4 indicadores do conjunto fechado aparecem no dashboard com nome, último
  valor, data de referência e variação, sempre que houver ao menos uma observação persistida.
- **SC-002**: 100% dos casos em que dashboard e tela de Detalhe exibem o mesmo indicador/mesma
  data de referência, o valor de variação (número, sinal, unidade) é idêntico entre as duas telas.
- **SC-003**: 0 ocorrências de card exibindo variação fabricada (0% ou traço) quando não há
  observação anterior suficiente — sempre estado explícito.
- **SC-004**: 0 chamadas diretas às APIs externas (BCB/FRED) originadas pelo carregamento do
  dashboard por usuário final.
- **SC-005**: Usuário consegue identificar o estado atual (valor + variação) de um indicador em
  até 5 segundos de leitura da tela, sem necessidade de cálculo manual.

## Assumptions

- Conjunto de indicadores é fechado nesta rodada do MVP: USD/BRL PTAX, Meta Selic, IPCA, FEDFUNDS
  (decidido em `docs/product/pdr-selecao-indicadores.md`) — adicionar indicador novo é fora de
  escopo desta spec.
- Dashboard depende de `sincronizacao` já ter persistido ao menos uma observação por indicador;
  esta spec não define a política de sync em si, apenas consome seu resultado.
- Rate limit e termos de uso completos de BCB Olinda/SGS e FRED não foram confirmados nesta rodada
  (BCB Olinda retornou HTTP 403 na tentativa de leitura automatizada da doc) — tratado como
  premissa em aberto na spec de `sincronizacao`, não bloqueia esta spec.
- Controle de favoritar diretamente no card do dashboard (vs. apenas na tela "Meus indicadores")
  é decisão de UI a ser tomada na arquitetura/implementação — não é requisito obrigatório desta
  spec.
- Texto exato do disclaimer (compliance/termos do FRED) pode ser refinado em revisão futura da
  spec sem invalidar os critérios de aceite atuais, desde que o conteúdo mínimo (aviso
  educacional, não é recomendação de investimento) seja mantido.

## Fora de escopo desta spec

- Gráfico ou série histórica no card (pertence à spec de Detalhe).
- Marcar/desmarcar favorito como requisito obrigatório desta spec (pertence à spec de Favoritos).
- Trading, ordem ou conversão de fato dentro do produto (fora do MVP inteiro — readme seção 8).
- Filtro, busca ou ordenação customizável de cards.
- Personalização de layout (drag-and-drop, temas).

## Perguntas resolvidas (speckit-clarify)

- (nenhuma pendente nesta rodada — vision.md já resolveu as decisões de escopo relevantes; itens
  em aberto na vision, seção 9, são premissas de outras specs — sincronizacao — ou decisões de UI
  deferidas à arquitetura, não bloqueiam esta spec)
