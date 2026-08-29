# Research: Perfil

Stack transversal já fixada (Fastify, React+Vite, Clerk — ver
`specs/004-sincronizacao/research.md`, `specs/003-favoritos/research.md`). Esta feature não
introduz stack nova, só consome o que já existe.

## Customização de aparência do Clerk

- **Decision**: `appearance` prop em `<SignIn>`/`<SignUp>` (`apps/web/src/pages/Login.tsx`),
  usando `variables` (`colorPrimary`, `colorBackground`, `colorText`, `borderRadius`) mapeados
  pros tokens já existentes em `apps/web/src/styles/tokens.css` (`--accent`, `--paper`, `--ink`,
  `--radius-sm`).
- **Rationale**: é o mecanismo oficial e documentado do Clerk pra tema, sem precisar de CSS
  global sobrescrevendo classe interna do widget (frágil, quebra em upgrade de versão).
- **Atenção de versão** (`fullstack-architect.md` exige checar antes de implementar, não
  assumir): `@clerk/clerk-react` instalado é `^5.61.3`. A doc do Clerk distingue "Core 2" (onde a
  prop de layout se chama `layout`, não `options`, e temas prontos vêm de `@clerk/themes`) de
  "Core 3"/SDK atual (`options`, temas de `@clerk/ui`). **Confirmar no momento da implementação**
  qual convenção vale pra v5 rodando `npm view @clerk/clerk-react@5.61.3` e testando localmente —
  não usar `options`/`layout` às cegas. `variables` (o que esta feature precisa) é igual nos
  dois, então o risco é baixo, mas checar mesmo assim.
- **Alternatives considered**: CSS global mirando classes internas do Clerk (`cl-*`) — frágil,
  quebra sem aviso em upgrade; construir formulário próprio com `useSignIn`/`useSignUp` — muito
  mais código pra um MVP, quando o `appearance` resolve o requisito real (paleta/tipografia).

## Tela Perfil — origem do dado

- **Decision**: `useUser()` de `@clerk/clerk-react`, direto no componente da página — sem novo
  hook próprio (não há lógica de transformação/fetch a esconder, é leitura direta do objeto
  `user` já carregado pelo `ClerkProvider`).
- **Rationale**: dado já está em memória (Clerk mantém sessão client-side), não requer chamada
  de rede nova nem endpoint novo no backend do Pulse FX — alinhado a FR-007 (zero mudança de
  backend).
- **Campo de data de criação**: confirmar o nome exato do campo (`user.createdAt` é o esperado
  pela doc geral do Clerk, mas confirmar contra a versão instalada antes de usar às cegas —
  mesma cautela de versão do item acima).
- **Alternatives considered**: replicar dado de conta no Postgres do Pulse FX (ex.: tabela
  `usuario`) — violaria FR-007 e duplicaria fonte de verdade que já é o Clerk; nenhum ganho real
  pra este escopo (só leitura, não há dado próprio do domínio Pulse FX associado à conta além do
  que já existe em `favorito`).

## Navegação Perfil ↔ Meus indicadores

- **Decision**: link `<a href="#meus-indicadores">`/`<a href="#perfil">`, mesmo padrão de hash
  routing nativo já usado em `App.tsx` (`specs/001-dashboard` ADR, sem lib de rota nova).
- **Rationale**: consistente com o resto do app; introduzir uma lib de rota (React Router) só
  pra esta feature seria desproporcional (ver `fullstack-architect.md`, ladder do ponytail).
