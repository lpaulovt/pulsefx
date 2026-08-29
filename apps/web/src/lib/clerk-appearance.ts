// Tokens do design system (issue #47) resolvidos para valor literal - Clerk aceita
// var() cru em borderRadius/fontFamily, mas cor passa por parser interno (hex/rgb/hsl)
// que "var(--x)" cru nao casa (confirmado em browser real, issue #49). Compartilhado
// entre Login (SignIn/SignUp) e Dashboard (UserButton) para o menu nao destoar do
// resto do app (issue #51).
function corResolvida(variavelCss: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variavelCss).trim();
}

export function appearanceClerk() {
  return {
    variables: {
      colorPrimary: corResolvida("--accent"),
      colorBackground: corResolvida("--surface"),
      colorText: corResolvida("--ink"),
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-body)",
    },
  };
}
