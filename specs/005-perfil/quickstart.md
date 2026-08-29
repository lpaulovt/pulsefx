# Quickstart: Perfil

## Pré-requisitos

- `npm run dev` (sobe tudo — ver `docs/SETUP.md`).
- Conta Clerk real configurada em `.env` (`CLERK_SECRET_KEY`/`CLERK_PUBLISHABLE_KEY`/
  `VITE_CLERK_PUBLISHABLE_KEY`) — sem isso, login não autentica de verdade (ver
  `specs/003-favoritos/quickstart.md` pro método de sessão real via Backend API, sem depender de
  humano/Turnstile).

## Validar aparência customizada do login

1. Abrir `http://localhost:5173/#login`.
2. Confirmar visualmente: cor de destaque (`--accent`, azul cobalto), fundo (`--paper`),
   tipografia (IBM Plex) — não o card branco/azul default da Clerk.

## Validar Perfil

1. Logar (ver método acima).
2. Navegar para `#perfil`.
3. Confirmar: e-mail visível; data de criação da conta visível; nome visível só se a conta Clerk
   tiver esse dado (senão, campo omitido, não aparece vazio/quebrado).
4. Clicar no link "Meus indicadores" a partir do Perfil — confirmar navegação.
5. A partir do Dashboard (ou Meus indicadores), confirmar que existe link visível pro Perfil.
6. Sem sessão, acessar `#perfil` direto — confirmar redirecionamento pra Login.

## Validar que nada quebrou

```bash
npm run test -w apps/web    # suíte completa continua passando
npm run test -w apps/api    # zero mudança esperada aqui — deve seguir 48/48 (specs anteriores)
```
