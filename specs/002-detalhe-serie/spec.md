---
feature: detalhe-serie
status: draft
tipo_serie: mista # fx-diária (PTAX) e macro-mensal (Selic, IPCA, FEDFUNDS)
fontes: [bcb, fred]
metricas:
  - nome: consistência de variação entre Detalhe e Dashboard
    baseline: desconhecido (feature nova)
    alvo: 100% dos indicadores com mesmo valor/sinal/unidade nas duas telas
personas: [importador-exportador, investidor-pessoa-fisica, curioso-economico]
depende_de: [dashboard, sincronizacao]
versao: 1
---

# Feature Specification: Detalhe de série

**Feature Branch**: `002-detalhe-serie`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Detalhe de série de câmbio e indicadores macro, conforme docs/product/detalhe-serie-vision.md"

## Referência

- Doc macro: [docs/product/detalhe-serie-vision.md](../../docs/product/detalhe-serie-vision.md)
- readme.md: seções 4.2 (Detalhe), 5 (variação percentual)
- Spec relacionada: [specs/001-dashboard/spec.md](../001-dashboard/spec.md) (regra de variação e
  disclaimer herdados, não redefinidos aqui)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver histórico de um indicador após notar variação no Dashboard (Priority: P1)

Usuário, tendo visto no Dashboard que um indicador variou, abre a tela de Detalhe daquele
indicador e vê a série histórica (tabela ou gráfico) dentro da janela padrão por tipo de série.

**Why this priority**: é o job-to-be-done central desta feature — sem histórico, o Detalhe não
entrega o valor que o Dashboard não pode entregar (contexto de tendência vs. ruído pontual).

**Independent Test**: com um indicador tendo observações persistidas suficientes, abrir a tela de
Detalhe e verificar que a série exibida cobre a janela padrão (30 dias úteis para fx-diária, 12
meses para macro-mensal), cada ponto com sua data de referência.

**Acceptance Scenarios**:

1. **Given** USD/BRL PTAX tem 30+ observações diárias persistidas, **When** usuário abre Detalhe
   deste indicador, **Then** a série exibida cobre até 30 dias úteis com dado persistido, cada
   ponto com data de referência visível.
2. **Given** IPCA tem 12+ observações mensais persistidas, **When** usuário abre Detalhe deste
   indicador, **Then** a série exibida cobre até 12 observações mensais, cada ponto com data de
   referência visível.

---

### User Story 2 - Entender limitações do dado antes de confiar nele (Priority: P1)

Usuário lê, na própria tela de Detalhe, um texto específico sobre a fonte do dado, possível
defasagem de sincronização, possibilidade de revisão histórica pela fonte, e ausência de
interpolação — antes de decidir agir com base no histórico.

**Why this priority**: métrica de guardrail explícita da vision — sem esse texto, usuário pode
tomar decisão real (câmbio, investimento) achando que o dado é definitivo/em tempo real, quando
não é. É tão crítico quanto ver o histórico em si.

**Independent Test**: abrir Detalhe de qualquer indicador e verificar que o texto de limitações
está presente e cobre os 4 pontos mínimos (fonte, defasagem de sync, possível revisão, sem
interpolação).

**Acceptance Scenarios**:

1. **Given** usuário abre a tela de Detalhe de qualquer indicador do PDR, **When** a tela carrega,
   **Then** o texto de limitações dos dados está visível, sem exigir ação extra do usuário para
   revelá-lo.

---

### User Story 3 - Confirmar que Detalhe e Dashboard não se contradizem (Priority: P2)

Usuário compara a variação exibida no Dashboard com a variação exibida no Detalhe para o mesmo
indicador e mesma data de referência, e vê o mesmo número, mesmo sinal, mesma unidade.

**Why this priority**: consistência entre telas é critério de aceite explícito nas duas visions —
uma divergência quebraria a confiança no produto inteiro, mas não é o valor central desta feature
(é uma garantia, não o job-to-be-done primário).

**Independent Test**: para um indicador com dado persistido, comparar programaticamente o valor de
variação retornado/exibido no Dashboard e no Detalhe para a mesma data de referência.

**Acceptance Scenarios**:

1. **Given** um indicador tem variação exibida no Dashboard para a data de referência D, **When**
   usuário abre o Detalhe do mesmo indicador, **Then** a variação exibida para a data D é idêntica
   (valor, sinal, unidade) à do Dashboard.

---

### Edge Cases

- Indicador com menos observações persistidas do que a janela padrão (ex.: sincronização
  recém-iniciada): tela mostra o que existe e indica explicitamente que o histórico ainda está
  sendo formado — nunca preenche com dado ausente/interpolado.
- Lacuna de calendário esperada (fim de semana, feriado, mês sem mudança de Selic): não é tratada
  como "dado ausente" nem gera alerta de instabilidade — é omissão normal de observação.
- Fonte revisou um valor histórico já persistido (ex.: IPCA reprocessado): tela exibe o valor mais
  recente conhecido pelo Pulse FX, e o texto de limitações já avisa que isso pode ocorrer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE exibir, para o indicador selecionado, uma série temporal (tabela ou
  gráfico simples) dentro da janela padrão por tipo de série: 30 dias úteis com dado persistido
  para fx-diária; 12 observações mensais persistidas para macro-mensal.
- **FR-002**: Cada observação exibida na série DEVE ter sua data de referência visível
  individualmente — não apenas a data do último valor.
- **FR-003**: Quando o indicador tiver menos observações persistidas do que a janela padrão,
  sistema DEVE exibir o que existe e indicar explicitamente que o histórico ainda está sendo
  formado — nunca preencher com dado ausente.
- **FR-004**: Sistema DEVE exibir texto de limitações dos dados cobrindo, no mínimo: fonte oficial
  do dado; que o valor é o último sincronizado pelo Pulse FX (podendo haver defasagem); que a fonte
  pode revisar valores publicados; que não há interpolação de dado ausente.
- **FR-005**: Sistema DEVE reaproveitar a mesma regra de variação percentual definida na spec de
  Dashboard (FR-005 de `specs/001-dashboard/spec.md`) — não redefinir regra própria.
- **FR-006**: Variação exibida no Detalhe para um indicador e data de referência DEVE ser idêntica
  (valor, sinal, unidade) à exibida no Dashboard para o mesmo indicador/data.
- **FR-007**: Sistema DEVE exibir o disclaimer educacional herdado da spec de Dashboard (FR-008 de
  `specs/001-dashboard/spec.md`) — mesmo requisito, sem redefinir texto aqui.

### Key Entities *(include if feature involves data)*

- **Série histórica**: conjunto ordenado de observações de um indicador, dentro da janela padrão
  definida por tipo de série, cada uma com valor e data de referência.
- **Texto de limitações**: conteúdo associado ao indicador (não ao usuário), cobrindo fonte,
  defasagem, possibilidade de revisão e ausência de interpolação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos indicadores do PDR exibem série histórica dentro da janela padrão por tipo
  de série, sempre que houver observações persistidas suficientes.
- **SC-002**: 100% das observações exibidas na série têm data de referência visível
  individualmente.
- **SC-003**: 100% dos casos em que Detalhe e Dashboard exibem o mesmo indicador/mesma data de
  referência, a variação (valor, sinal, unidade) é idêntica entre as duas telas.
- **SC-004**: 0 ocorrências de dado interpolado/fabricado preenchendo lacuna de calendário na série
  exibida.
- **SC-005**: Texto de limitações dos dados está presente em 100% das aberturas da tela de
  Detalhe, cobrindo os 4 pontos mínimos da seção 5.2 da vision.

## Assumptions

- Escolha entre tabela ou gráfico simples para exibir a série é decisão de UI/arquitetura — ambos
  satisfazem o requisito de produto igualmente.
- Frequência/política real de revisão histórica de cada fonte (BCB SGS, FRED) não foi mapeada em
  detalhe nesta rodada — texto de limitações trata isso de forma genérica até confirmação futura,
  sem bloquear esta spec.
- Regra de variação, indicadores e disclaimer são herdados de `specs/001-dashboard/spec.md` — esta
  spec não os redefine.

## Fora de escopo desta spec

- Exportação de dado (CSV/PDF).
- Zoom/pan avançado de gráfico.
- Comparação lado a lado de dois indicadores na mesma tela.
- Anotações do usuário sobre a série, alertas de limite/threshold.
- Revisão histórica retroativa de valores como funcionalidade de produto (é risco documentado, não
  requisito).

## Perguntas resolvidas (speckit-clarify)

- (nenhuma pendente nesta rodada — vision.md já resolveu as decisões de escopo relevantes; itens
  em aberto na vision, seção 9, são refinamentos futuros que não bloqueiam esta spec)
