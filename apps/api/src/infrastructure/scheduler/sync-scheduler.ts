import cron from "node-cron";
import { CATALOGO_INDICADORES } from "../../domain/indicador/catalogo.js";
import type { SincronizarIndicador } from "../../application/sincronizacao/sincronizar-indicador.js";

const FX_DIARIA = CATALOGO_INDICADORES.filter((i) => i.tipoSerie === "fx-diaria");
const MACRO_MENSAL = CATALOGO_INDICADORES.filter((i) => i.tipoSerie === "macro-mensal");

/**
 * Registra os jobs agendados (FR-001/FR-002, research.md): fx-diaria 1x/dia util apos o
 * fechamento PTAX, macro-mensal 1x/dia (verificacao). Nunca depende de trafego de usuario.
 */
export function registrarSyncJobs(sincronizarIndicador: SincronizarIndicador): void {
  cron.schedule("0 18 * * 1-5", () => {
    void Promise.all(FX_DIARIA.map((indicador) => sincronizarIndicador.executar(indicador, "agendado")));
  });

  cron.schedule("0 19 * * *", () => {
    void Promise.all(MACRO_MENSAL.map((indicador) => sincronizarIndicador.executar(indicador, "agendado")));
  });
}
