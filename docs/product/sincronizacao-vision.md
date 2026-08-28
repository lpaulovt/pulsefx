# Sincronização

## 1. Problema

Todas as outras funcionalidades (Dashboard, Detalhe, Favoritos) assumem que existe **dado já
persistido e confiável** para exibir sem chamar a fonte externa a cada acesso do usuário. Sem uma
política de atualização clara, o sistema corre dois riscos opostos: (a) bater na API do BCB/FRED a
cada carregamento de tela (chamada descontrolada/redundante, risco de rate limit e de violar
termos de uso), ou (b) nunca atualizar e mostrar dado morto sem o usuário saber.

Evidência: `readme.md` seção 4.4 ("política clara de atualização — TTL, job agendado, endpoint
admin protegido — que evite chamadas descontroladas ou redundantes às APIs externas").

## 2. Objetivo e Métricas de Sucesso

- **Objetivo de negócio:** garantir que o dado exibido ao usuário esteja "razoavelmente fresco"
  sem que o volume de chamadas às fontes externas dependa do tráfego de usuários do Pulse FX.
- **Métrica principal:** número de chamadas às APIs externas (BCB/FRED) é função da política de
  sincronização (tempo/agendamento), não do número de acessos de usuários ao Dashboard/Detalhe.
- **Métricas de guardrail:**
  - nenhuma tela do produto dispara chamada síncrona à fonte externa em resposta a uma requisição
    de usuário final;
  - defasagem entre "última observação publicada pela fonte" e "última observação persistida pelo
    Pulse FX" é sempre visível/rastreável (data de referência exibida nas telas, seção 5.1 do
    `dashboard-vision.md`), nunca escondida.

## 3. Personas / Usuários-alvo

- **Usuário final** (importador/exportador, investidor PF, curioso econômico): não interage
  diretamente com sincronização, mas depende dela para ver dado correto sem lentidão.
- **Operador/mantenedor do sistema** (papel implícito no MVP — quem avalia/roda o projeto): precisa
  conseguir disparar ou verificar uma sincronização manualmente (ex.: endpoint admin) sem depender
  de esperar o próximo ciclo agendado, para fins de demonstração/depuração.

## 4. Escopo

### Dentro do escopo (in)

- Política de atualização por indicador/tipo de série, com frequência compatível com a natureza do
  dado (seção 5.1 abaixo).
- Mecanismo de disparo da sincronização (job agendado e/ou endpoint admin protegido) — qual dos
  dois, ou ambos, é decisão de arquitetura; produto exige que **exista pelo menos um mecanismo
  documentado e que ele não dependa de tráfego de usuário final**.
- Proteção do endpoint admin (se existir) contra acionamento não autorizado — requisito de
  produto ("protegido"), mecanismo exato (chave, autenticação) é decisão de arquitetura.
- Comportamento observável quando a sincronização falha (fonte externa fora do ar, resposta
  inesperada): sistema deve manter o último dado válido persistido e não quebrar Dashboard/
  Detalhe — "falha de sync" nunca deve virar "tela de erro para o usuário final" enquanto houver
  dado histórico válido para mostrar.

### Fora do escopo (out)

- Streaming/tempo real, tick-by-tick (seção 8 do readme — fora de escopo do MVP inteiro).
- Notificação ativa ao usuário sobre atualização de dado (push, e-mail) — não citado no readme.
- Painel de observabilidade/alerta de falha de sync para operador — desejável, mas não é requisito
  de produto explícito do readme; se implementado, é decisão de arquitetura, não bloqueia esta
  vision.

### Não-objetivos (non-goals)

- Não é um pipeline de dados genérico para qualquer fonte futura — é a política específica para
  BCB SGS e FRED, indicadores do PDR.

## 5. Requisitos de alto nível

### 5.1 Frequência de atualização por tipo de série

| Tipo de série | Indicadores | Frequência de sincronização | Justificativa |
|---|---|---|---|
| **fx-diária** | USD/BRL PTAX | **1x por dia útil**, após o horário em que a fonte publica o fechamento do dia (BCB publica PTAX de fechamento à tarde, dia útil) | mais frequente que isso não muda o dado (fonte só publica 1x/dia); menos frequente atrasaria a leitura do usuário que checa de manhã. |
| **macro-mensal** | Meta Selic, IPCA, FEDFUNDS | **1x por dia** (verificação, não recálculo) — o dado só muda quando a fonte publica novo mês/nova decisão do Copom, mas o job roda diariamente para capturar a publicação assim que ela sair, sem depender de calendário exato de cada fonte | evita hardcodar datas de divulgação de cada fonte (IPCA, Copom, BLS/Fed têm calendários distintos); verificação diária é barata (poucas séries) e garante que o dado apareça no Pulse FX no mesmo dia em que a fonte publica, sem esperar um ciclo semanal/mensal fixo. |

- Em ambos os casos, a sincronização é um **job agendado** (produto exige isso existir); o
  **endpoint admin protegido** é o mecanismo de contingência para forçar atualização fora do ciclo
  (ex.: demonstração, depuração) — não substitui o job.
- Rodar sync com mais frequência do que o necessário (ex.: de hora em hora para série mensal) é
  exatamente o "chamada descontrolada/redundante" que o readme pede para evitar — a tabela acima
  é o limite superior de frequência aceitável em nível de produto.

### 5.2 Não-funcionais em nível de produto

- Política de sync deve ser **documentada no README raiz** (exigência explícita do readme seção
  6), não só neste vision doc.
- Sincronização deve ser resiliente a indisponibilidade temporária da fonte: dado antigo continua
  servindo Dashboard/Detalhe, sem exceção não tratada visível ao usuário final.
- Endpoint admin (se existir) nunca deve ser acionável por usuário final não autenticado/
  autorizado.

## 6. Restrições e premissas

- **Premissa não confirmada nesta rodada** (marcar como incerteza, não fato): rate limit exato de
  BCB (Olinda/SGS) e do FRED. Tentativa de leitura do Swagger do Olinda retornou HTTP 403 na
  automação desta sessão; a doc geral do FRED indexada não trouxe o número de requisições/minuto
  permitido. **Consequência para esta vision:** a frequência da tabela 5.1 (1x/dia útil para FX,
  1x/dia para macro-mensal) foi dimensionada para ser conservadora o suficiente para não depender
  desse número — mesmo o pior caso documentado publicamente para APIs públicas gratuitas
  (dezenas de req/min) comporta folga enorme para 4 séries verificadas 1x/dia. Ainda assim,
  recomenda-se ao `fullstack-architect` confirmar o número exato antes de decidir retry/backoff
  técnico.
- FRED exige API key (confirmado: string alfanumérica de 32 caracteres) — gestão de chave/segredo
  é decisão de arquitetura (`.env`, secret manager), não de produto.
- BCB SGS não exige chave (confirmado por chamada real durante esta rodada de pesquisa).

## 7. Riscos e dependências

- Risco: se a fonte mudar horário de publicação sem aviso (ex.: BCB atrasar divulgação da PTAX),
  o job diário pode capturar o dado do dia anterior — mitigação de produto é a data de referência
  sempre visível (o usuário vê que o dado é de D-1, não que o sistema "errou").
- Risco: indisponibilidade prolongada da fonte externa (não coberta por retry simples) deixaria o
  dado persistido cada vez mais desatualizado — mitigação de produto é o texto de limitações dos
  dados (`detalhe-serie-vision.md` §5.2) alertar que pode haver defasagem; não há requisito de
  produto para alerta ativo de operador nesta rodada (ver "fora de escopo").
- Dependência: todas as demais features (Dashboard, Detalhe, Favoritos) dependem desta política
  estar correta para não quebrar a métrica de guardrail de "nunca fabricar dado".

## 8. Critérios de aceite macro

- Existe um mecanismo de sincronização que não depende de acesso de usuário final para disparar
  (job agendado, documentado no README raiz).
- Existe um mecanismo de contingência (ex.: endpoint admin protegido) para forçar sync fora do
  ciclo, sem estar acessível a usuário não autorizado.
- Frequência de sync está alinhada à tabela da seção 5.1 (não mais frequente que o necessário por
  tipo de série).
- Falha temporária de uma fonte externa não derruba Dashboard/Detalhe — último dado válido
  persistido continua sendo servido.

## 9. Abertos / decisões pendentes

- Confirmar rate limit real de BCB Olinda/SGS e FRED antes de finalizar detalhes técnicos de
  retry/backoff (não bloqueia esta vision, que já assume cenário conservador — mas bloqueia
  afinamento fino em `plan.md` do `fullstack-architect`).
- Confirmar, junto à leitura completa dos Termos de Uso do FRED
  (`fred.stlouisfed.org/docs/api/terms_of_use.html`, não lida por completo nesta rodada), se há
  exigência específica de cache/atribuição que afete a política de sync além do rate limit.
- Mecanismo exato de proteção do endpoint admin (autenticação simples vs. chave de API vs. IP
  allowlist) — decisão de arquitetura, registrada aqui como aberta.
