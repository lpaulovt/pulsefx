import type { Indicador } from "./indicador.js";

// Conjunto fechado do MVP (docs/product/pdr-selecao-indicadores.md) - espelha o seed da
// migration apps/api/migrations/*_create-sincronizacao-tables.cjs. Nao e CRUD de usuario
// (specs/001-dashboard/data-model.md) - fonte de leitura em runtime para scheduler/rota admin.
export const CATALOGO_INDICADORES: readonly Indicador[] = [
  {
    id: "usd-brl-ptax",
    nome: "USD/BRL (PTAX venda)",
    tipoSerie: "fx-diaria",
    fonte: "bcb",
    unidade: "percentual",
  },
  {
    id: "meta-selic",
    nome: "Meta Selic",
    tipoSerie: "macro-mensal",
    fonte: "bcb",
    unidade: "pontos-percentuais",
  },
  {
    id: "ipca",
    nome: "IPCA (variacao mensal)",
    tipoSerie: "macro-mensal",
    fonte: "bcb",
    unidade: "percentual",
  },
  {
    id: "fed-funds",
    nome: "Federal Funds Effective Rate",
    tipoSerie: "macro-mensal",
    fonte: "fred",
    unidade: "percentual",
  },
];
