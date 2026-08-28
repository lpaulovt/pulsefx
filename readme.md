# **Pulse FX**

## 1. Contexto

Construir um **MVP** chamado **Pulse FX**: aplicação para acompanhar **câmbio (BRL)** e **indicadores macro** a partir de **fontes públicas**, com dados **persistidos**, **API própria** e cliente **web** de qualidade próxima à produção. O objetivo é avaliar **domínio de produto**, **engenharia backend e frontend**, **dados**, **testes** e **reprodutibilidade** da solução (incluindo **containerização** conforme a tabela abaixo).

### Avaliação: resultado final e sinais de engenharia

A banca considera **também aspectos implícitos** — **não apenas** se o MVP funciona no estado final da entrega. Podem influenciar o julgamento, entre outros: **estrutura e organização do código**, **sequência e qualidade das mensagens de commit**, **arquitetura e modularização**, **organização do repositório** (com **preferência por monorepo**: um único repositório Git reunindo frontend web, backend e artefatos compartilhados; outro formato **só** se **justificado** no README), **pastas e limites entre pacotes/serviços**, **documentação útil** e **demais práticas** de engenharia de software perceptíveis no histórico e no código. Critérios de peso detalhados são **internos** ao processo seletivo.

---

## 2. Stack obrigatória e alinhamento à vaga

| Área | Requisito |
|------|-----------|
| **Frontend** | **Web** com **React** + **TypeScript**. |
| **Backend** | **Node.js** + **TypeScript**, código de **produção** (camadas, SOLID, Clean Code) — não prova de conceito descartável. |
| **Dados** | **PostgreSQL** é o banco de dados obrigatório. |
| **Containerização** | **Docker** + **Docker Compose** (API, PostgreSQL e demais serviços necessários à solução). |
| **Testes** | Mínimo de **5 arquivos de teste** (ver seção 7). |

---

## 3. Fontes de dados

- **Obrigatório:** integrar dados de **duas fontes distintas**, incluindo:
  - **BCB** (dados abertos / séries — ex.: câmbio);
  - **FRED** (Federal Reserve Economic Data — API com chave).
- **Escolha das séries:** **o candidato define** quais indicadores expor (mínimo um conjunto coerente para o Pulse FX), lê a **documentação oficial** de cada fonte e explica **em 2–5 linhas por indicador** por que faz sentido para o usuário.

### Fontes de referência (URLs)

Referências de partida; o candidato deve **confirmar** endpoints, parâmetros e termos de uso na documentação vigente.

| Fonte | Descrição (resumo) | URL principal |
|--------|---------------------|---------------|
| **BCB — Dados Abertos** | Catálogos e conjuntos de dados públicos do Banco Central do Brasil. | https://dadosabertos.bcb.gov.br/ |
| **BCB — Olinda (PTAX)** | API de câmbio (ex.: taxas de fechamento PTAX); documentação interativa (Swagger). | https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/ |
| **BCB — SGS (séries temporais)** | Portal de localização e metadados de séries do Sistema Gerenciador de Séries Temporais (códigos de série, periodicidade). | https://www3.bcb.gov.br/sgspub/ |
| **FRED — portal** | Séries econômicas dos EUA e de outros provedores agregados pelo Federal Reserve Bank of St. Louis. | https://fred.stlouisfed.org/ |
| **FRED — documentação da API** | Parâmetros, limites e exemplos de chamadas (`fred/series/observations`, etc.). | https://fred.stlouisfed.org/docs/api/fred/ |
| **FRED — chave de API** | Registro e gestão de API key. | https://fredaccount.stlouisfed.org/apikeys |
| **IPEADATA** *(opcional)* | Séries socioeconômicas do Ipea (Brasil); útil como fonte extra se o desenho do MVP fizer sentido. | https://www.ipeadata.gov.br/ |
| **World Bank Open Data — API** *(opcional)* | Indicadores de desenvolvimento (mundo); exige leitura da documentação de indicadores e países. | https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation |

---

## 4. Funcionalidades (MVP)

1. **Dashboard (web):** cards com nome do indicador, **último valor**, **data de referência** da observação e **variação percentual** segundo regras documentadas (seção 5).
2. **Detalhe (web):** série temporal (tabela ou gráfico simples), janela de histórico por tipo de série, texto sobre **limitações dos dados**.
3. **“Meus indicadores”:** permitir marcar/desmarcar favoritos com **persistência real** no backend (ou estratégia híbrida **documentada** no README).
4. **Sincronização:** política clara de **atualização** (TTL, job agendado, endpoint admin protegido, etc.) que **evite** chamadas descontroladas ou redundantes às APIs externas.
5. **Disclaimer** visível: informação **educacional**; **não** é recomendação de investimento.

---

## 5. Variação percentual (regra de negócio)

O candidato deve **definir, implementar e documentar** a variação **por indicador ou por tipo de série** (ex.: FX diário vs macro mensal).

**Requisitos:**

- **Último valor** = observação mais recente **válida** já persistida (alinhada à política de sync/cache).
- **Data de referência** = data da observação exibida (não confundir com “hora da consulta”).
- **Variação %** com denominador explícito, por exemplo:
  - **Séries diárias (FX):** comparar último fechamento com o valor de **N dias úteis** anteriores com dado disponível (o candidato fixa N e justifica).
  - **Séries mensais (macro):** comparar último mês com **N meses** anteriores (N fixo e justificado — não usar “últimos 5 dias” em série mensal).
- **Consistência:** mesma regra no **dashboard** e na **tela de detalhe**.
- **Calendário:** documentar tratamento de **fins de semana / feriados / lacunas** (ex.: último dado conhecido vs interpolação — interpolação de mercado financeiro costuma ser desaconselhada; preferir regra simples e honesta).

---

## 6. Entregáveis

- **Monorepo:** um **único** repositório Git contendo **frontend web**, **backend** e demais pacotes necessários ao MVP, com **README raiz** único contendo:
  - como subir o ambiente (**Docker Compose**);
  - variáveis de ambiente;
  - decisões técnicas relevantes e trade-offs;
  - séries escolhidas + URLs/documentação de referência;
  - regras de **variação** e **janela de histórico** por tipo de série;
  - como rodar o **frontend web**;
  - como rodar **testes** e **lint**.
- **Migrations** PostgreSQL versionadas.
- **Opcional recomendado:** screenshots do fluxo completo.

---

## 7. Testes automatizados

**Mínimo: 5 arquivos de teste** com sufixo convencional, por exemplo:

- `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`

**O que conta:**

- Arquivos com **casos de teste reais** (assertivas sobre comportamento).
- **Não** contar: arquivos vazios, apenas `describe` sem `it`, ou duplicação artificial do mesmo teste renomeada só para bater número.

**Distribuição sugerida (referência, não obrigatória):**

1. Regra de **domínio** (ex.: cálculo de variação / normalização de datas).
2. **Persistência** ou repositório.
3. **HTTP** (rota/handler da API).
4. **Frontend web** (componente **ou** hook com lógica relevante).
5. **Integração** (ex.: API + PostgreSQL com ambiente de teste, ou estratégia equivalente documentada).

Cobertura em **%** não é critério; **qualidade** e **relevância** dos testes sim.

---

## 8. Fora de escopo

Trading, ordens, conta bancária, pagamentos, KYC completo, recomendação de investimento, streaming tick-by-tick, multi-tenant enterprise.

---

## 9. Submissão

- Instruções claras para **rodar localmente em menos de 15 minutos** em máquina com Docker (quando aplicável).

---

## 10. Política de sincronização (implementação — `specs/004-sincronizacao`)

Requisito da seção 4.4: atualização por mecanismo agendado, sem depender de tráfego de usuário,
com contingência protegida. Implementado em `apps/api` da seguinte forma:

### Mecanismo

- **Job agendado (`node-cron`)** — único disparador de chamadas a BCB/FRED. Nenhuma rota de
  Dashboard/Detalhe/Favoritos chama fonte externa; todas leem apenas o Postgres já sincronizado
  (FR-005). Registrado em `apps/api/src/infrastructure/scheduler/sync-scheduler.ts` e iniciado em
  `apps/api/src/main.ts`.
- **Endpoint de contingência**: `POST /admin/sync` (protegido, ver abaixo) força uma sincronização
  fora do ciclo — para demonstração/depuração, nunca substitui o job agendado.

### Frequência (por tipo de série, `docs/product/sincronizacao-vision.md` §5.1)

| Tipo de série | Indicadores | Cron | Frequência |
|---|---|---|---|
| `fx-diaria` | USD/BRL PTAX | `0 18 * * 1-5` | 1x por dia útil, após o horário em que o BCB publica o fechamento PTAX |
| `macro-mensal` | Meta Selic, IPCA, FEDFUNDS | `0 19 * * *` | 1x por dia (verificação — o dado só muda quando a fonte publica, mas a checagem diária evita hardcodar calendário de divulgação de cada fonte) |

Rodar com mais frequência do que a tabela acima é o "chamada descontrolada/redundante" que esta
política existe para evitar (FR-002).

### Proteção do endpoint admin

Header `X-Admin-Key` comparado à env var `ADMIN_SYNC_KEY` — `401 { "error": "unauthorized" }` se
ausente ou incorreto (`apps/api/src/interface/http/plugins/admin-auth.ts`). Decisão registrada em
`specs/004-sincronizacao/research.md`: chave simples é proporcional ao requisito ("protegido, não
público") sem acoplar ao Clerk (usado só por `specs/003-favoritos`, módulo não relacionado).

```bash
curl -X POST http://localhost:3000/admin/sync \
  -H "X-Admin-Key: $ADMIN_SYNC_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
# 202 { "status": "accepted", "indicadores": [...] }
```

### Resiliência a falha de fonte externa (FR-006)

`SincronizarIndicador` (caso de uso) faz 1 tentativa + 1 retry com backoff fixo curto (5s); se
ambas falharem, a falha é registrada em `job_execucao` (`status = falha_fonte_externa`, com
`detalhe`) e a exceção **nunca** propaga para o scheduler/rota — a última `observacao` válida
persistida continua servindo Dashboard/Detalhe sem erro visível ao usuário final.

### Idempotência

Upsert por `(indicador_id, data_referencia)` (`apps/api/migrations/*_create-sincronizacao-tables.cjs`)
— reprocessar a mesma janela (job rodando de novo, ou `POST /admin/sync` chamado duas vezes) nunca
duplica observação.

---

**Versão do briefing:** 1.9  
**Última atualização:** 2026-06-10