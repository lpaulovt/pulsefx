# Meus indicadores (favoritos)

## 1. Problema

Com 4 indicadores no MVP (PDR), curadoria pessoal parece pouco urgente hoje — mas o requisito é
explícito no readme (seção 4.3) e simula um cenário real: o usuário-alvo acompanha um subconjunto
específico (ex.: só câmbio + Selic) e não quer escanear indicadores irrelevantes pra ele toda vez
que abre o produto. Além disso, é o requisito que testa persistência real de preferência do
usuário no backend (não é cosmético).

Evidência: `readme.md` seção 4.3 ("permitir marcar/desmarcar favoritos com persistência real no
backend, ou estratégia híbrida documentada no README").

## 2. Objetivo e Métricas de Sucesso

- **Objetivo de negócio:** permitir que o usuário marque quais indicadores importam para ele, e
  que essa escolha sobreviva a reload de página/nova sessão (persistência real).
- **Métrica principal:** marcar/desmarcar um indicador como favorito reflete corretamente em
  requisição subsequente (nova carga de página, nova sessão) — sem depender só de estado de
  cliente (localStorage isolado, sem backend, não atende ao requisito "persistência real").
- **Métricas de guardrail:** favoritar/desfavoritar não deve gerar chamada às fontes externas
  (BCB/FRED) — é operação sobre preferência do usuário, não sobre dado de indicador.

## 3. Personas / Usuários-alvo

Mesmas personas de `dashboard-vision.md` §3. Job-to-be-done específico: "quero ver só o que me
importa sem precisar escanear todo o conjunto toda vez".

## 4. Escopo

### Dentro do escopo (in)

- Ação de marcar/desmarcar favorito por indicador, disponível a partir de Dashboard e/ou Detalhe
  (local exato do controle é decisão de UI, não de produto).
- Persistência real da preferência (backend, ou estratégia híbrida explicitamente documentada no
  README raiz — não decidido aqui, é escolha do `fullstack-architect`; este documento só exige que
  a persistência **exista de fato** e sobreviva a reload/nova sessão).
- Tela/visão de "Meus indicadores" mostrando apenas os indicadores marcados como favoritos, com o
  mesmo formato de card do Dashboard (nome, último valor, data de referência, variação) — mesma
  regra de variação e mesmo disclaimer herdados de `dashboard-vision.md`.
- Estado vazio explícito quando o usuário não marcou nenhum favorito ainda (não é erro).

### Fora do escopo (out)

- Múltiplas listas/coleções nomeadas de favoritos, ordenação customizada dentro da lista,
  compartilhamento de lista entre usuários — não citado no readme, especulativo.
- Autenticação/conta de usuário como pré-requisito desta feature: como o MVP não define sistema de
  contas em outro lugar do readme, este documento assume que "usuário" pode ser resolvido de forma
  mais simples (ex.: identificador de sessão/dispositivo) — decisão de **como** identificar o
  usuário é de arquitetura; produto só exige que a preferência marcada seja atribuível e recuperável
  de forma consistente para quem a marcou.
- Login social, múltiplos perfis — fora do MVP.

### Não-objetivos (non-goals)

- Não é um sistema de contas completo — é persistência de uma preferência simples por usuário/
  sessão.

## 5. Requisitos de alto nível

### 5.1 Funcionais

- O sistema deve permitir marcar um indicador como favorito e desmarcar, com efeito imediato
  percebido pelo usuário (o indicador some/aparece na visão "Meus indicadores").
- O estado de favorito deve persistir de forma real (não apenas em memória do cliente) — se o
  README raiz documentar uma estratégia híbrida (ex.: cache local + sync assíncrono para backend),
  ela deve ser descrita lá; esta vision não prescreve a técnica, só o resultado observável: reload
  de página e nova sessão no mesmo navegador/dispositivo devem preservar o estado marcado.
- A visão "Meus indicadores" reaproveita a mesma regra de variação e mesmo formato de card do
  Dashboard — não é uma segunda implementação de regra de negócio.

### 5.2 Não-funcionais em nível de produto

- Ação de favoritar/desfavoritar é uma operação sobre preferência do usuário — nunca deve
  depender de ida à fonte externa (BCB/FRED) para responder.
- Estado vazio ("nenhum favorito ainda") deve orientar o usuário a ir ao Dashboard para escolher,
  não deixar tela em branco sem explicação.

## 6. Restrições e premissas

- Premissa: como o readme não especifica sistema de autenticação para o MVP, assume-se que a
  "persistência real no backend" está associada a um identificador de usuário/sessão cuja natureza
  exata (conta, cookie de sessão, device id) é decisão de arquitetura — registrado aqui como
  aberto (seção 9), não decidido por este documento.
- Reaproveita indicadores e regra de variação já fixados em `dashboard-vision.md` e no PDR — não
  há indicador exclusivo de favoritos.

## 7. Riscos e dependências

- Depende do Dashboard/Detalhe para exibição consistente do card na visão de favoritos.
- Risco: se a estratégia de identificação de usuário/sessão escolhida na arquitetura for frágil
  (ex.: perde-se ao trocar de navegador), a "persistência real" percebida pelo usuário pode falhar
  mesmo com backend correto — risco a ser resolvido em nível de arquitetura, mas que deve ser
  documentado no README raiz (exigência explícita do readme seção 4.3 para a "estratégia
  híbrida").

## 8. Critérios de aceite macro

- Usuário consegue marcar e desmarcar favorito para qualquer indicador do conjunto do PDR.
- Estado marcado sobrevive a reload de página e a nova sessão no mesmo dispositivo/navegador.
- Visão "Meus indicadores" mostra apenas os indicadores marcados, com valor/data/variação
  consistentes com o Dashboard.
- Estado vazio tratado explicitamente, sem tela quebrada ou sem explicação.

## 9. Abertos / decisões pendentes

- Qual identificador de usuário/sessão sustenta a persistência (conta explícita vs. sessão
  anônima vs. estratégia híbrida) — decisão de arquitetura, mas precisa constar no README raiz
  (exigência do readme seção 4.3); não bloqueia esta vision, mas bloqueia o `spec.md` desta
  feature até estar resolvida.
- Onde exatamente o controle de favoritar aparece (card do Dashboard, tela de Detalhe, ambos) —
  decisão de UI, registrada como aberta e não bloqueante para a Fase 2.
