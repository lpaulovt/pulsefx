---
feature: perfil
status: draft
tipo_serie: n/a # feature de conta/UI, não de série de dado
fontes: [] # não consome BCB/FRED; dados de conta vêm 100% do Clerk
metricas:
  - nome: consistência visual de login/cadastro com o design system
    baseline: 0% (tema default da Clerk, sem relação com Pulse FX)
    alvo: 100% (appearance customizado, mesma paleta/tipografia do resto do app)
personas: [importador-exportador, investidor-pessoa-fisica, curioso-economico]
depende_de: [favoritos]
versao: 1
---

# Feature Specification: Perfil (conta do usuário + login/cadastro personalizado)

**Feature Branch**: `005-perfil`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "spec para login e cadastro com o Clerk customizado (hoje default,
sem personalização), mais uma parte interna de perfil para ver dados da conta; indicadores
favoritos já existe (specs/003-favoritos), reaproveitado, não recriado."

## Referência

- Doc macro: [docs/product/perfil-vision.md](../../docs/product/perfil-vision.md)
- readme.md: seção 4.3 (persistência de favorito, já implementada) — esta spec **não** é
  requisito do briefing original; é escopo adicional explícito do dono do produto.
- Spec relacionada: [specs/003-favoritos/spec.md](../003-favoritos/spec.md) (Clerk, guarda de
  rota, `GET /favoritos` reaproveitados, não redefinidos aqui)
- Design system: issue #47 (tokens de cor/tipografia em `apps/web/src/styles/tokens.css`)

## Clarifications

### Session 2026-08-29

- Q: A tela "Meus indicadores" (favoritos) vira parte do Perfil, ou continua separada? → A:
  Continuam **separadas** — Perfil só linka para "Meus indicadores", não a absorve.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login/cadastro com identidade visual do Pulse FX (Priority: P1)

Usuário abre a tela de login (ou é redirecionado pra lá ao tentar favoritar/ver perfil sem
sessão) e vê um formulário de entrar/criar conta com a paleta e tipografia do Pulse FX, não o
card branco genérico padrão da Clerk.

**Why this priority**: é o primeiro contato do usuário com autenticação — inconsistência visual
aqui quebra a percepção de produto acabado logo na entrada do único fluxo com login do MVP.

**Independent Test**: abrir `#login`, inspecionar que cores/fontes do formulário `<SignIn>`/
`<SignUp>` batem com os tokens de `tokens.css` (não os defaults da Clerk).

**Acceptance Scenarios**:

1. **Given** usuário sem sessão acessa a tela de login, **When** a tela carrega, **Then**
   `<SignIn>`/`<SignUp>` usam cor de destaque, tipografia e espaçamento do design system do
   Pulse FX (`appearance` customizado), não o tema default da Clerk.
2. **Given** usuário sem sessão tenta acessar "Meus indicadores" ou "Perfil", **When** o guard
   redireciona pra Login, **Then** a mesma aparência customizada se aplica.

---

### User Story 2 - Ver dados da própria conta (Priority: P1)

Usuário autenticado acessa a tela Perfil e vê nome (quando existir), e-mail e data de criação
da conta.

**Why this priority**: é o requisito central desta feature — sem isso não existe "área de
conta" nenhuma no produto.

**Independent Test**: logar, navegar pra Perfil, verificar que nome/e-mail/data aparecem, vindos
do Clerk (`useUser()`), sem chamada nova ao backend do Pulse FX.

**Acceptance Scenarios**:

1. **Given** usuário autenticado, **When** acessa Perfil, **Then** vê e-mail e data de criação
   da conta; nome aparece quando o Clerk tiver esse dado, caso contrário o campo é omitido (não
   exibe "undefined"/vazio quebrado).
2. **Given** usuário sem sessão, **When** tenta acessar Perfil, **Then** é redirecionado pra
   Login (mesmo padrão de guarda de rota de `specs/003-favoritos`).

---

### User Story 3 - Navegar entre Perfil e Meus indicadores (Priority: P2)

Usuário no Perfil consegue ir pra "Meus indicadores" por um link visível, e vice-versa.

**Why this priority**: sem isso, Perfil vira uma tela isolada sem conexão com o resto do fluxo
autenticado — prioridade menor que P1 porque não bloqueia o valor central (ver dados da conta),
só a navegabilidade.

**Independent Test**: no Perfil, clicar no link e chegar em "Meus indicadores"; verificar que
existe algum ponto de entrada pro Perfil a partir de uma tela autenticada (Dashboard ou Meus
indicadores).

**Acceptance Scenarios**:

1. **Given** usuário autenticado no Perfil, **When** clica no link "Meus indicadores", **Then**
   navega pra essa tela.
2. **Given** usuário autenticado em qualquer tela, **When** procura um jeito de chegar no
   Perfil, **Then** encontra um link visível (Dashboard e/ou Meus indicadores).

---

### Edge Cases

- Usuário Clerk sem nome cadastrado (só e-mail, comum em signup rápido): Perfil não exibe campo
  de nome quebrado/vazio — omite graciosamente.
- Sessão expira enquanto o usuário está no Perfil: comportamento consistente com o resto do app
  (guarda de rota já trata isso via `<SignedIn>`/`<SignedOut>` — esta spec não redefine).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE customizar a aparência (`appearance`) de `<SignIn>`/`<SignUp>` para
  usar a paleta e tipografia do design system do Pulse FX (`tokens.css`), substituindo o tema
  default da Clerk.
- **FR-002**: Sistema DEVE exibir uma tela "Perfil", acessível apenas com sessão ativa, com
  e-mail e data de criação da conta do usuário autenticado (via `useUser()` do Clerk).
- **FR-003**: Sistema DEVE exibir o nome do usuário no Perfil quando o Clerk tiver esse dado
  disponível; omitir o campo (nunca mostrar vazio/`undefined`) quando não houver.
- **FR-004**: Acessar Perfil sem sessão DEVE redirecionar para Login, seguindo o mesmo padrão de
  guarda de rota já usado por "Meus indicadores" (`specs/003-favoritos` FR-004/FR-004a).
- **FR-005**: Perfil DEVE conter um link visível para a tela "Meus indicadores".
- **FR-006**: DEVE existir, em ao menos uma tela acessada por usuário autenticado (Dashboard
  e/ou Meus indicadores), um link visível para o Perfil.
- **FR-007**: Esta feature NUNCA introduz nova tabela/coluna no Postgres do Pulse FX — dados de
  conta vêm inteiramente do Clerk; a única persistência própria do domínio continua sendo
  `favorito(user_id, indicador_id)`, já existente.

### Key Entities *(include if feature involves data)*

- Nenhuma entidade nova de domínio. Perfil consome dado de conta do Clerk (externo, não
  modelado no Postgres do Pulse FX) e reaproveita `Favorito`
  ([specs/003-favoritos/data-model.md](../003-favoritos/data-model.md)) só para o link/contagem
  opcional, se a implementação decidir mostrar isso — não é requisito obrigatório desta spec.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das renderizações de `<SignIn>`/`<SignUp>` usam a paleta/tipografia do Pulse
  FX (verificável por inspeção visual/snapshot, não o tema default da Clerk).
- **SC-002**: 100% dos usuários autenticados que acessam Perfil veem e-mail e data de criação da
  conta.
- **SC-003**: 0 ocorrências de campo de nome exibido vazio/quebrado quando o Clerk não tem esse
  dado.
- **SC-004**: 100% das tentativas de acessar Perfil sem sessão resultam em redirecionamento para
  Login.
- **SC-005**: 0 mudanças de contrato em `GET/POST/DELETE /favoritos` — suíte de testes de
  `specs/003-favoritos` continua passando sem alteração.

## Assumptions

- "Data de criação da conta" vem do campo padrão do Clerk (`user.createdAt` ou equivalente na
  versão instalada de `@clerk/clerk-react`) — confirmar o nome exato do campo na implementação,
  não inventar formato de data.
- Perfil não exige nenhuma nova variável de ambiente além das já configuradas para Clerk
  (`specs/003-favoritos`).
- Link entre Perfil e Meus indicadores usa o mesmo mecanismo de navegação já existente no app
  (hash routing nativo, `App.tsx`) — não introduz biblioteca de rota nova.

## Fora de escopo desta spec

- Editar dados da conta (nome/e-mail/senha) — Clerk já resolve nativamente, não é requisito
  desta rodada.
- Avatar/foto de perfil.
- Fundir "Meus indicadores" dentro do Perfil (decisão de IA já tomada: continuam separados).
- Qualquer alteração ao backend de favoritos (`specs/003-favoritos`) — reaproveitado tal como
  está.

## Perguntas resolvidas (speckit-clarify)

- P: A tela "Meus indicadores" vira parte do Perfil, ou continua separada?
  R: Continuam separadas — Perfil só linka para "Meus indicadores".
