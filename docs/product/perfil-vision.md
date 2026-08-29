# Perfil (conta do usuário + login/cadastro personalizado)

## 1. Problema

Duas dores distintas, hoje reais no produto:

1. Login/cadastro (`<SignIn>`/`<SignUp>` do Clerk) renderizam com o tema **default** da Clerk —
   card branco genérico, sem nenhuma relação visual com o Pulse FX. Destoa do design system
   aplicado no resto do app (issue #47 — paleta, tipografia IBM Plex, tokens).
2. Usuário autenticado não tem nenhum lugar pra ver dados da própria conta (nome, e-mail,
   desde quando existe) — só existe a tela "Meus indicadores" (favoritos), que é sobre
   indicadores, não sobre a conta em si.

Evidência: inspeção direta do código (`apps/web/src/pages/Login.tsx` sem prop `appearance`;
nenhuma página `Perfil`/`Account` no repositório).

## 2. Objetivo e Métricas de Sucesso

- **Objetivo de negócio:** login/cadastro e área de conta com identidade visual consistente com
  o resto do produto — sinal de acabamento de produto, não só de funcionalidade.
- **Métrica principal:** usuário autenticado consegue ver nome/e-mail da própria conta em uma
  tela dedicada, e a tela de login/cadastro usa a paleta/tipografia do Pulse FX (não o card
  branco default da Clerk).
- **Métricas de guardrail:** nenhuma mudança de contrato de API (favoritos continua sendo
  `GET/POST/DELETE /favoritos`, sem alteração); nenhuma duplicação de lógica de autenticação
  (Perfil consome os mesmos hooks do Clerk já usados no resto do app, `useUser`/`useAuth`).

## 3. Personas / Usuários-alvo

Mesmas personas de `dashboard-vision.md` §3 — a diferença é que aqui a persona já está
autenticada (fez login pra favoritar um indicador) e quer confirmar/ver os dados da própria
conta, ou só espera uma experiência de login que pareça parte do mesmo produto, não um
formulário genérico de terceiro.

## 4. Escopo

### Dentro do escopo (in)

- Customização visual (`appearance` prop do Clerk) de `<SignIn>`/`<SignUp>` — cores, tipografia
  e espaçamento alinhados ao design system existente (`apps/web/src/styles/tokens.css`).
- Nova tela **Perfil**, acessível só autenticado, mostrando: nome (quando existir), e-mail,
  data de criação da conta (dados já disponíveis via `useUser()` do Clerk — nenhum dado novo
  precisa ser persistido no Postgres do Pulse FX).
- Link, a partir do Perfil, para a tela "Meus indicadores" (favoritos) já existente —
  **decisão de IA**: as duas continuam telas/rotas separadas, não fundidas.
- Link, a partir do Dashboard/MeusIndicadores, para o Perfil (ponto de entrada visível quando
  autenticado).

### Fora de escopo (out)

- Editar dados da conta (trocar nome/e-mail/senha) — Clerk já oferece isso nativamente via
  `<UserProfile>`, mas não é requisito desta rodada; se incluído, é decisão de UI do
  arquiteto/implementação usar o componente pronto da Clerk, não construir formulário próprio.
- Avatar/foto de perfil customizado além do que o Clerk já gerencia.
- Fundir "Meus indicadores" dentro do Perfil (decisão já tomada: continuam separados).
- Qualquer dado de conta armazenado no Postgres do Pulse FX — a conta em si é 100% Clerk;
  Postgres só guarda a associação `favorito(user_id, indicador_id)`, já existente.

### Não-objetivos (non-goals)

- Não é um sistema de gestão de conta completo (billing, times, papéis) — é uma tela de
  visualização simples mais um acabamento visual de login.

## 5. Requisitos de alto nível

### 5.1 Funcionais

- Sistema deve exibir `<SignIn>`/`<SignUp>` com aparência customizada (paleta/tipografia do
  Pulse FX), não o tema default da Clerk.
- Sistema deve exibir uma tela "Perfil" para usuário autenticado, com nome/e-mail/data de
  criação da conta.
- Perfil deve conter link visível para "Meus indicadores".
- Deve existir um ponto de entrada visível para o Perfil quando o usuário está autenticado
  (ex.: link no Dashboard ou em "Meus indicadores").
- Acessar Perfil sem sessão deve redirecionar para Login (mesmo padrão de guarda de rota já
  usado em "Meus indicadores").

### 5.2 Não-funcionais em nível de produto

- Consistência visual: Perfil e Login usam os mesmos tokens de cor/tipografia do resto do app
  — não é uma tela "à parte" visualmente.

## 6. Restrições e premissas

- Reaproveita 100% o backend de favoritos já existente (`specs/003-favoritos`) — este documento
  não redecide nada de persistência de favorito.
- Dados de conta vêm inteiramente do Clerk (`useUser()`) — não requer nova tabela/migration no
  Postgres do Pulse FX.
- Fonte da verdade de produto continua sendo `readme.md` — esta feature é escopo **adicional**
  explicitamente pedido pelo usuário/dono do produto, não um requisito do briefing original (o
  briefing não pede tela de perfil nem customização de tema de login). Registrado aqui para não
  ser confundido com requisito obrigatório do processo seletivo.

## 7. Riscos e dependências

- Depende de `specs/003-favoritos` (Clerk já configurado, guarda de rota já existente) e do
  design system da issue #47 (tokens de cor/tipografia).
- Risco: customizar aparência do Clerk incorretamente pode quebrar acessibilidade/contraste dos
  formulários — mitigação é usar a skill `frontend-design`/`clerk-custom-ui` e validar
  visualmente antes de mergear.

## 8. Critérios de aceite macro

- Login/cadastro visualmente alinhados ao resto do produto (não é mais o card branco default).
- Usuário autenticado acessa uma tela Perfil e vê nome/e-mail/data de criação da conta.
- Perfil linka para Meus indicadores; existe caminho de volta/entrada visível entre as telas.
- Nenhum teste existente quebra; nenhuma mudança de contrato de API de favoritos.

## 9. Abertos / decisões pendentes

- Nenhuma — decisão de IA (Perfil separado de Meus indicadores) já resolvida com o usuário.
