import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App.js";

// Unico ponto do MVP com login (specs/003-favoritos) - ClerkProvider so envolve a
// arvore para a rota "Meus indicadores"/Login usarem <SignedIn>/<SignedOut>/useAuth;
// Dashboard/Detalhe continuam publicos (research.md). Mesmo padrao de fallback de
// VITE_API_BASE_URL em api-client.ts - sem conta Clerk real neste ambiente, o
// placeholder so satisfaz o formato exigido pelo SDK (ver .env.example/readme.md 4.3).
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  "pk_test_cGxhY2Vob2xkZXIuY2xlcmsuYWNjb3VudHMuZGV2JA==";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
