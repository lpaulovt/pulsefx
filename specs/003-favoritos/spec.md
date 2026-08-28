---
feature: favoritos
status: draft
tipo_serie: n/a # feature de preferência de usuário, não de série de dado
fontes: [] # não consome BCB/FRED diretamente; reaproveita indicadores já sincronizados
metricas:
  - nome: persistência real de favorito entre sessões e dispositivos (conta Clerk)
    baseline: desconhecido (feature nova)
    alvo: 100% dos favoritos marcados sobrevivem a reload e a login em outro dispositivo
personas: [importador-exportador, investidor-pessoa-fisica, curioso-economico]
depende_de: [dashboard]
versao: 1
---

# Feature Specification: Meus indicadores (favoritos)

**Feature Branch**: `003-favoritos`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Meus indicadores (favoritos), conforme docs/product/favoritos-vision.md"

## Referência

- Doc macro: [docs/product/favoritos-vision.md](../../docs/product/favoritos-vision.md)
- readme.md: seção 4.3 (Meus indicadores)
- Spec relacionada: [specs/001-dashboard/spec.md](../001-dashboard/spec.md) (formato de card e
  regra de variação reaproveitados, não redefinidos aqui)

## Clarifications

### Session 2026-08-28

- Q: Qual identificador sustenta o vínculo usuário↔favorito no backend, já que o MVP não define
  sistema de contas em nenhum outro lugar do readme? → A: Conta explícita (login) — usuário cria
  conta antes de favoritar. Restrição técnica definida pelo usuário: provedor de autenticação
  gerenciado Clerk (constraint para o `fullstack-architect`, não redecidir provedor no plan.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcar e desmarcar indicador como favorito (Priority: P1)

Usuário marca um indicador como favorito (a partir de Dashboard e/ou Detalhe) e vê o efeito
imediato: o indicador passa a aparecer na visão "Meus indicadores". Ao desmarcar, some dessa
visão.

**Why this priority**: é o job-to-be-done central da feature — sem essa ação básica não há
curadoria pessoal possível.

**Independent Test**: marcar um indicador como favorito e verificar que ele aparece na visão "Meus
indicadores"; desmarcar e verificar que desaparece.

**Acceptance Scenarios**:

1. **Given** um indicador do PDR não está marcado como favorito, **When** usuário marca como
   favorito, **Then** o indicador passa a aparecer na visão "Meus indicadores".
2. **Given** um indicador está marcado como favorito, **When** usuário desmarca, **Then** o
   indicador deixa de aparecer na visão "Meus indicadores".

---

### User Story 2 - Favorito sobrevive a reload, nova sessão e troca de dispositivo (Priority: P1)

Usuário autenticado marca um favorito, sai e entra novamente (mesmo dispositivo ou outro,
mesma conta), e o favorito continua marcado — prova de persistência real vinculada à conta, não
apenas estado de memória do cliente ou de um único dispositivo.

**Why this priority**: é o requisito explícito do readme ("persistência real no backend") e o que
diferencia esta feature de um toggle cosmético client-side. Sem isso a feature não atende ao
critério de avaliação do MVP.

**Independent Test**: marcar favorito autenticado, simular reload completo de página (nova carga,
sem estado de memória do cliente) e login em outro dispositivo com a mesma conta, verificar que o
favorito continua marcado nos dois casos.

**Acceptance Scenarios**:

1. **Given** usuário autenticado marcou um indicador como favorito, **When** recarrega a página,
   **Then** o indicador continua aparecendo em "Meus indicadores".
2. **Given** usuário autenticado marcou um indicador como favorito, **When** faz login com a mesma
   conta em outro dispositivo/navegador, **Then** o indicador continua aparecendo em "Meus
   indicadores".

---

### User Story 3 - Ver estado vazio quando não há favoritos (Priority: P3)

Usuário que nunca marcou favorito abre a visão "Meus indicadores" e vê uma mensagem explícita
orientando a ir ao Dashboard escolher indicadores, não uma tela em branco.

**Why this priority**: guardrail de produto explícito — evita que usuário interprete tela vazia
como erro do sistema. Menor prioridade que marcar/persistir porque só afeta a primeira visita.

**Independent Test**: abrir "Meus indicadores" sem nenhum favorito marcado e verificar mensagem de
estado vazio.

**Acceptance Scenarios**:

1. **Given** usuário não marcou nenhum favorito, **When** abre "Meus indicadores", **Then** vê
   mensagem explícita orientando a marcar favoritos no Dashboard, sem tela em branco.

---

### Edge Cases

- Usuário troca de navegador/dispositivo mas mantém a mesma conta (login Clerk): favoritos devem
  aparecer normalmente — persistência é por conta, não por dispositivo/sessão local.
- Usuário tenta marcar/ver favoritos sem estar autenticado: sistema deve direcionar para
  login/cadastro antes de permitir a ação.
- Indicador favoritado é removido do conjunto do PDR no futuro (fora do escopo do MVP atual, mas
  não deve quebrar a tela — favorito órfão simplesmente não aparece).
- Ação de favoritar/desfavoritar nunca dispara chamada às fontes externas (BCB/FRED) — é operação
  sobre preferência do usuário, independente do estado do dado do indicador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir marcar um indicador do conjunto do PDR como favorito, com
  efeito imediato percebido pelo usuário.
- **FR-002**: Sistema DEVE permitir desmarcar um indicador previamente favoritado, com efeito
  imediato percebido pelo usuário.
- **FR-003**: Estado de favorito DEVE persistir de forma real (backend, ou estratégia híbrida
  documentada no README raiz) — sobrevive a reload de página e a nova sessão no mesmo
  dispositivo/navegador.
- **FR-004**: Sistema DEVE exigir conta de usuário explícita (autenticação) para marcar/desmarcar e
  visualizar favoritos — a preferência é vinculada à conta, não a sessão anônima/dispositivo.
- **FR-004a**: Sistema DEVE permitir que o usuário crie conta e faça login antes de usar a
  funcionalidade de favoritos — este é o único ponto do MVP que introduz autenticação de usuário.
- **FR-005**: Sistema DEVE exibir visão "Meus indicadores" mostrando apenas os indicadores
  marcados como favoritos, reaproveitando o mesmo formato de card (nome, último valor, data de
  referência, variação) e a mesma regra de variação definidos em `specs/001-dashboard/spec.md`.
- **FR-006**: Sistema DEVE exibir estado vazio explícito quando o usuário não marcou nenhum
  favorito, orientando a ir ao Dashboard para escolher.
- **FR-007**: Ação de marcar/desmarcar favorito NUNCA DEVE disparar chamada às APIs externas
  (BCB/FRED).

### Key Entities *(include if feature involves data)*

- **Favorito**: associação entre um identificador de usuário/sessão (ver FR-004) e um indicador do
  conjunto do PDR, com estado marcado/desmarcado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das ações de marcar/desmarcar favorito refletem imediatamente na visão "Meus
  indicadores", sem necessidade de reload manual.
- **SC-002**: 100% dos favoritos marcados sobrevivem a reload de página e a login com a mesma
  conta em outro dispositivo/navegador.
- **SC-003**: 0 chamadas às APIs externas (BCB/FRED) originadas por ação de favoritar/desfavoritar.
- **SC-004**: 100% das visitas a "Meus indicadores" sem favoritos marcados mostram mensagem de
  estado vazio explícita, nunca tela em branco.

## Assumptions

- Local exato do controle de favoritar (card do Dashboard, tela de Detalhe, ambos) é decisão de UI
  a ser tomada na arquitetura/implementação — não bloqueia esta spec.
- Autenticação é restrita a esta feature — Dashboard, Detalhe e Sincronização permanecem
  acessíveis sem login (readme não pede conta para as demais telas); favoritos é a única área do
  MVP que introduz conta de usuário.
- **Constraint técnica definida pelo usuário** (não é decisão deste documento, mas restringe o
  `fullstack-architect`): provedor de autenticação gerenciado **Clerk**. Escolha de fluxo (login
  social vs. email/senha), esquema de sessão e integração ficam a cargo da arquitetura.
- Estratégia de autenticação/persistência (conta via Clerk) deve ser documentada no README raiz
  por exigência explícita do readme seção 4.3 ("estratégia híbrida documentada").
- Indicadores e regra de variação são os mesmos de `specs/001-dashboard/spec.md` — não há
  indicador exclusivo de favoritos.

## Fora de escopo desta spec

- Múltiplas listas/coleções nomeadas de favoritos.
- Ordenação customizada dentro da lista de favoritos.
- Compartilhamento de lista entre usuários.
- Login social, múltiplos perfis, sistema de contas completo.

## Perguntas resolvidas (speckit-clarify)

- P: Qual identificador sustenta o vínculo usuário↔favorito no backend?
  R: Conta explícita (login), usando Clerk como provedor de autenticação (constraint técnica do
  usuário — ver Assumptions).
