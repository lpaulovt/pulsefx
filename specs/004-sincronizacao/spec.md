---
feature: sincronizacao
status: draft
tipo_serie: mista # política cobre fx-diária (PTAX) e macro-mensal (Selic, IPCA, FEDFUNDS)
fontes: [bcb, fred]
metricas:
  - nome: chamadas às fontes externas função de agendamento, não de tráfego de usuário
    baseline: desconhecido (feature nova)
    alvo: 0 chamadas a BCB/FRED originadas por requisição de usuário final
personas: [usuario-final, operador-mantenedor]
depende_de: [pdr-selecao-indicadores]
versao: 1
---

# Feature Specification: Sincronização

**Feature Branch**: `004-sincronizacao`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Política de sincronização de câmbio e indicadores macro, conforme docs/product/sincronizacao-vision.md"

## Referência

- Doc macro: [docs/product/sincronizacao-vision.md](../../docs/product/sincronizacao-vision.md)
- readme.md: seções 4.4 (Sincronização), 6 (entregáveis — política documentada no README raiz)
- Dependência reversa: `specs/001-dashboard/spec.md`, `specs/002-detalhe-serie/spec.md` e
  `specs/003-favoritos/spec.md` assumem que esta política já persistiu dado válido.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dado atualizado sem depender de tráfego de usuário (Priority: P1)

Operador/mantenedor confia que os indicadores são atualizados por um mecanismo agendado,
independente de quantos usuários finais acessam Dashboard/Detalhe — usuário final nunca dispara
chamada às fontes externas ao carregar uma tela.

**Why this priority**: é o requisito central da feature e o guardrail mais crítico do MVP — sem
isso, qualquer uma das outras features pode gerar chamada descontrolada/redundante às APIs
externas, arriscando rate limit ou violação de termos de uso.

**Independent Test**: acessar Dashboard/Detalhe repetidamente e verificar (via log/instrumentação)
que nenhuma chamada a BCB/FRED foi originada por essas requisições — apenas pelo mecanismo
agendado.

**Acceptance Scenarios**:

1. **Given** o mecanismo de sincronização está configurado, **When** múltiplos usuários finais
   acessam Dashboard/Detalhe repetidamente, **Then** nenhuma chamada às APIs externas (BCB/FRED) é
   originada por essas requisições.
2. **Given** um indicador fx-diária (PTAX), **When** o dia útil avança após o horário de publicação
   da fonte, **Then** uma nova observação é persistida sem intervenção manual.

---

### User Story 2 - Forçar sincronização fora do ciclo para demonstração/depuração (Priority: P2)

Operador/mantenedor dispara manualmente uma sincronização (endpoint admin protegido) sem esperar o
próximo ciclo agendado, para fins de demonstração ou depuração.

**Why this priority**: necessário para avaliação/demonstração do MVP, mas é mecanismo de
contingência — o job agendado é o requisito primário (P1), este é complementar.

**Independent Test**: acionar o mecanismo de contingência autenticado e verificar que uma nova
sincronização ocorre; tentar acionar sem autorização e verificar que é recusado.

**Acceptance Scenarios**:

1. **Given** operador autorizado aciona o mecanismo de contingência, **When** a chamada é feita,
   **Then** uma sincronização ocorre fora do ciclo agendado.
2. **Given** um agente não autorizado tenta acionar o mecanismo de contingência, **When** a
   tentativa ocorre, **Then** o sistema recusa a ação.

---

### User Story 3 - Fonte externa indisponível não quebra o produto (Priority: P1)

Quando BCB ou FRED estão temporariamente indisponíveis durante uma tentativa de sincronização, o
Dashboard/Detalhe continuam servindo o último dado válido persistido, sem exceção não tratada
visível ao usuário final.

**Why this priority**: guardrail de resiliência explícito — sem isso, uma instabilidade externa
temporária derruba o produto inteiro para o usuário final, que não tem nenhuma relação com aquela
falha.

**Independent Test**: simular indisponibilidade da fonte externa durante uma tentativa de
sincronização e verificar que Dashboard/Detalhe continuam respondendo com o último dado válido.

**Acceptance Scenarios**:

1. **Given** a fonte externa está indisponível durante uma tentativa de sincronização, **When** um
   usuário final acessa Dashboard/Detalhe, **Then** o último dado válido persistido é exibido, sem
   erro não tratado.

---

### Edge Cases

- Fonte muda horário de publicação sem aviso (ex.: BCB atrasa divulgação da PTAX): job diário pode
  capturar o dado do dia anterior — não é falha, é refletido pela data de referência exibida nas
  telas consumidoras.
- Indisponibilidade prolongada da fonte (não resolvida por tentativa simples): dado persistido fica
  cada vez mais desatualizado — mitigação de produto é o texto de limitações nas telas
  consumidoras, não um requisito de alerta ativo nesta spec.
- Sincronização roda mais vezes do que o necessário por tipo de série: é o comportamento
  explicitamente indesejado que esta spec previne (ver FR-002).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE atualizar cada indicador via mecanismo agendado (job), independente de
  acesso de usuário final — fx-diária (PTAX) no mínimo 1x por dia útil após horário de publicação
  da fonte; macro-mensal (Selic, IPCA, FEDFUNDS) no mínimo 1x por dia (verificação).
- **FR-002**: Frequência de sincronização NUNCA DEVE exceder o necessário por tipo de série (tabela
  da vision, seção 5.1) — mais frequente que isso é chamada descontrolada/redundante.
- **FR-003**: Sistema DEVE oferecer mecanismo de contingência (ex.: endpoint admin) para forçar
  sincronização fora do ciclo agendado, sem substituir o job.
- **FR-004**: Mecanismo de contingência DEVE ser protegido contra acionamento por agente não
  autorizado.
- **FR-005**: Nenhuma requisição de usuário final a Dashboard/Detalhe/Favoritos DEVE disparar
  chamada síncrona às fontes externas (BCB/FRED).
- **FR-006**: Quando uma fonte externa estiver indisponível durante tentativa de sincronização,
  sistema DEVE manter o último dado válido persistido servindo as telas consumidoras, sem exceção
  não tratada visível ao usuário final.
- **FR-007**: Política de sincronização (frequência, mecanismo de disparo, proteção do endpoint
  admin) DEVE estar documentada no README raiz do repositório.

### Key Entities *(include if feature involves data)*

- **Job de sincronização**: unidade de execução agendada que busca observações novas de uma fonte
  externa e persiste como Observação (ver `specs/001-dashboard/spec.md`).
- **Mecanismo de contingência**: ponto de entrada protegido que dispara sincronização fora do
  ciclo agendado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 chamadas às APIs externas (BCB/FRED) originadas por requisição de usuário final a
  qualquer tela do produto.
- **SC-002**: 100% dos indicadores fx-diária têm nova observação persistida em até 1 dia útil após
  a fonte publicar o fechamento.
- **SC-003**: 100% das tentativas de acionar o mecanismo de contingência sem autorização são
  recusadas.
- **SC-004**: 100% das indisponibilidades temporárias de fonte durante sincronização resultam em
  Dashboard/Detalhe continuando a servir o último dado válido, sem erro não tratado.
- **SC-005**: Política de sincronização (frequência, mecanismo, proteção) está documentada no
  README raiz.

## Assumptions

- Rate limit exato de BCB Olinda/SGS e FRED não foi confirmado nesta rodada (Olinda retornou HTTP
  403 na tentativa de leitura automatizada da documentação) — frequência da seção 5.1 da vision
  foi dimensionada de forma conservadora para não depender desse número; confirmação fina fica para
  `plan.md` do `fullstack-architect`.
- FRED exige API key (confirmado); gestão de chave/segredo é decisão de arquitetura, não de
  produto.
- BCB SGS não exige chave (confirmado por chamada real durante a pesquisa da vision).
- Mecanismo exato de proteção do endpoint de contingência (autenticação simples, chave de API, IP
  allowlist) é decisão de arquitetura — esta spec só exige que a proteção exista.

## Fora de escopo desta spec

- Streaming/tempo real, tick-by-tick.
- Notificação ativa ao usuário sobre atualização de dado (push, e-mail).
- Painel de observabilidade/alerta de falha de sync para operador.

## Perguntas resolvidas (speckit-clarify)

- (nenhuma pendente nesta rodada — mecanismo exato de proteção do endpoint e rate limit fino são
  decisões de arquitetura/plan.md, não bloqueiam este spec.md)
