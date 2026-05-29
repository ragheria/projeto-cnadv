# SDD - Espelhamento DataJuri -> Trello

## 1. Visao geral

Este documento descreve o desenho de software do projeto `projeto-cnadv`, cujo objetivo e espelhar registros operacionais do DataJuri no Trello para uso operacional da equipe.

No estado atual, o problema principal nao e complexidade tecnica, e sim definicao funcional de origem, filtro e comportamento dos objetos que devem ser sincronizados. Ja existe evidencia no repositorio de que:

- o DataJuri expoe o modulo `Atividade`;
- tambem existem modulos correlatos como `Tarefa` e `Compromisso`;
- nao ha webhook nativo no DataJuri para este caso de uso;
- a estrategia adotada e sincronizacao por polling;
- o intervalo inicial previsto e de 30 minutos;
- ja existem fluxos exploratorios em `n8n` para leitura e envio ao Trello.

## 2. Objetivo do sistema

Criar uma integracao que:

- consulte periodicamente o DataJuri;
- identifique novos itens relevantes para a operacao;
- transforme esses itens em cards no Trello;
- evite duplicidades;
- permita evolucao posterior para regras de producao, observabilidade e refinamento funcional.

## 3. Escopo

### 3.1 Dentro do escopo inicial

- autenticacao na API do DataJuri;
- consulta periodica dos modulos candidatos a espelhamento;
- leitura inicial de `Atividade`, com possibilidade de incluir `Tarefa` e `Compromisso`;
- mapeamento de campos do DataJuri para estrutura de card do Trello;
- criacao de cards em lista predefinida do Trello;
- deduplicacao para evitar recriacao do mesmo card em execucoes futuras;
- documentacao das hipoteses e decisoes abertas.

### 3.2 Fora do escopo inicial

- sincronizacao bidirecional entre Trello e DataJuri;
- atualizacao de cards existentes com mudancas posteriores no DataJuri;
- encerramento automatico de cards quando o item original for concluido;
- uso de webhooks do DataJuri;
- interface administrativa dedicada;
- motor de regras complexo por tipo de atividade.

## 4. Contexto funcional

O processo desejado e:

- um registro nasce no DataJuri;
- o integrador identifica que esse registro deve aparecer no Trello;
- o sistema monta um card com titulo, descricao e, quando aplicavel, data de vencimento;
- o card e criado na lista configurada do board de destino;
- o identificador do item processado fica registrado para nao ser espelhado novamente.

O principal ponto ainda em descoberta e a definicao de quais entidades representam o que a operacao chama de "atividade". No material atual, existem tres caminhos em avaliacao:

- `Atividade`;
- `Tarefa`;
- `Compromisso`.

O SDD assume que o modulo `Atividade` e a origem inicial obrigatoria e que `Tarefa` e `Compromisso` seguem como hipoteses a validar.

## 5. Fontes de evidencia ja existentes

No repositorio ha duas referencias importantes:

- collection Postman do DataJuri em [docs/datajuri/DataJuri API.postman_collection.json](C:\Users\rapha\Documents\PROJETOS\projeto-cnadv\docs\datajuri\DataJuri%20API.postman_collection.json);
- fluxos exploratorios do `n8n` em [prod-workflow/cnadv/CNADV - Atividades → Trello__JjeuKzgG7FR2XRDr.json](C:\Users\rapha\Documents\PROJETOS\projeto-cnadv\prod-workflow\cnadv\CNADV%20-%20Atividades%20%E2%86%92%20Trello__JjeuKzgG7FR2XRDr.json) e [prod-workflow/cnadv/NNADV - Atividades → Trello__rWUVhz9QRUA24pQ7.json](C:\Users\rapha\Documents\PROJETOS\projeto-cnadv\prod-workflow\cnadv\NNADV%20-%20Atividades%20%E2%86%92%20Trello__rWUVhz9QRUA24pQ7.json).

Esses fluxos mostram que a solucao exploratoria atual ja faz:

- execucao agendada a cada 30 minutos;
- obtencao de token do DataJuri;
- consulta ao endpoint `/v1/entidades/Atividade`;
- em uma variante, consulta adicional aos endpoints `/v1/entidades/Tarefa` e `/v1/entidades/Compromisso`;
- transformacao dos registros em payload de card;
- criacao de cards no Trello;
- deduplicacao em memoria estatica do workflow.

## 6. Arquitetura proposta

### 6.1 Visao de alto nivel

O sistema sera composto pelos seguintes blocos:

- `Scheduler`: dispara a sincronizacao periodica;
- `DataJuri Client`: autentica e consulta os modulos configurados;
- `Normalizer`: converte respostas heterogeneas do DataJuri em um modelo canonico;
- `Decision Engine`: decide se um item deve ou nao ser espelhado;
- `Dedup Store`: registra itens ja processados;
- `Trello Client`: cria cards e aplica campos adicionais;
- `Observability`: registra logs, metricas e falhas operacionais.

### 6.2 Fluxo principal

1. O scheduler inicia a execucao.
2. O integrador autentica no DataJuri.
3. O integrador consulta os modulos habilitados.
4. Os resultados sao normalizados para um formato unico.
5. As regras de filtro determinam quais itens entram no espelhamento.
6. O sistema verifica deduplicacao.
7. Para cada item novo, o sistema monta o payload do card.
8. O card e criado no Trello.
9. O identificador do item e persistido como processado.
10. Logs e metricas da rodada sao emitidos.

## 7. Modelo canonico proposto

Para reduzir o acoplamento com os nomes especificos do DataJuri, o integrador deve trabalhar internamente com um objeto canonico:

```json
{
  "sourceSystem": "DataJuri",
  "sourceModule": "Atividade",
  "sourceId": "359213",
  "type": "Prazo",
  "title": "PRZ - 0005308-... - PROMOTEC - ...",
  "description": "Texto normalizado sem HTML",
  "ownerName": "Nome do responsavel",
  "processCode": "Pasta ou referencia do processo",
  "clientName": "Nome do cliente",
  "createdAt": "2026-04-08T12:00:00Z",
  "dueAt": "2026-04-09T12:00:00Z",
  "status": "Aberto",
  "raw": {}
}
```

Campos minimos obrigatorios:

- `sourceModule`;
- `sourceId`;
- `title`.

Campos desejaveis para enriquecer o card:

- `description`;
- `ownerName`;
- `processCode`;
- `clientName`;
- `dueAt`;
- `status`.

## 8. Integracao com DataJuri

### 8.1 Autenticacao

O fluxo de autenticacao conhecido usa:

- `POST /oauth/token`;
- header `Authorization: Basic <base64>`;
- body com `grant_type=password`, `username` e `password`.

### 8.2 Endpoints de descoberta e leitura

Pelo material atual, os endpoints relevantes sao:

- `GET /v1/modulos` para descoberta dos modulos disponiveis;
- `GET /v1/campos/:modulo` para descoberta de campos validos;
- `GET /v1/entidades/:modulo` para leitura paginada de registros.

### 8.3 Modulos candidatos

A ordem de priorizacao para o projeto deve ser:

1. `Atividade`;
2. `Tarefa`;
3. `Compromisso`.

Essa ordem existe porque `Atividade` ja aparece explicitamente no fluxo exploratorio principal e no enunciado do projeto.

### 8.4 Estrategia de consulta

A estrategia inicial deve ser conservadora:

- paginacao com `page` e `pageSize`;
- filtro por registros nao concluidos quando o modulo suportar isso;
- filtro por janela temporal quando houver campo confiavel de criacao ou prazo;
- uso de `removerHtml=true` sempre que fizer sentido;
- lista explicita de campos para reduzir payload e manter previsibilidade.

## 9. Integracao com Trello

### 9.1 Operacao principal

A primeira versao precisa apenas de:

- criar card em lista preconfigurada;
- definir titulo;
- definir descricao;
- definir data de vencimento quando existir.

### 9.2 Mapeamento inicial sugerido

- titulo do card: assunto ou descricao principal do item no DataJuri;
- descricao do card: processo, cliente, responsavel, observacoes e identificador de origem;
- due date: prazo fatal, prazo ou data equivalente;
- labels: tipo funcional inferido do item quando houver regra segura.

### 9.3 Idempotencia no Trello

Mesmo com deduplicacao local, a descricao do card deve carregar um marcador de origem:

- `Source: DataJuri`;
- `Module: <modulo>`;
- `Source ID: <id>`.

Esse marcador permite auditoria manual e futura reconciliacao automatica.

## 10. Deduplicacao e persistencia

Os fluxos exploratorios atuais usam `staticData` do `n8n`, o que e util para prova de conceito, mas fragil para producao.

### 10.1 Requisito de producao

A solucao de producao deve persistir ao menos:

- `sourceModule`;
- `sourceId`;
- hash opcional do payload normalizado;
- `trelloCardId`;
- `createdAt`;
- `lastSeenAt`.

### 10.2 Opcoes de persistencia

Opcoes aceitaveis para a primeira versao de producao:

- tabela relacional simples;
- arquivo local controlado, se o ambiente for unico e administrado;
- datastore leve como SQLite.

Para maturidade operacional, a recomendacao e usar persistencia transacional simples em banco ou SQLite, evitando depender apenas do estado em memoria do workflow.

## 11. Regras de negocio iniciais

As regras abaixo sao recomendadas para a primeira versao:

- espelhar apenas itens abertos ou nao concluidos;
- ignorar itens sem identificador confiavel;
- ignorar itens sem titulo funcional minimo;
- nao recriar item ja processado;
- preservar no card o identificador de origem para rastreabilidade;
- limitar o espelhamento inicial a um ou poucos boards/listas predefinidos.

Regras ainda em aberto:

- quando `Atividade` deve virar card e quando deve ser ignorada;
- se `Tarefa` e `Compromisso` entram no mesmo board ou em listas distintas;
- como tratar alteracoes posteriores no registro de origem;
- como tratar exclusao ou conclusao apos a criacao do card.

## 12. Agendamento

### 12.1 Politica inicial

- frequencia: a cada 30 minutos;
- execucao serial por rodada;
- timeout por chamada externa configurado;
- retry controlado para falhas temporarias.

### 12.2 Evolucao esperada

Se o volume crescer, a frequencia pode cair para 10 ou 15 minutos, desde que:

- a API do DataJuri suporte a carga;
- haja paginacao segura;
- a deduplicacao esteja persistida;
- o Trello nao seja impactado por rajadas de criacao.

## 13. Tratamento de erros

Erros esperados:

- falha de autenticacao no DataJuri;
- expiracao de token;
- resposta com schema inconsistente;
- timeout ou indisponibilidade da API do DataJuri;
- falha de criacao do card no Trello;
- item duplicado por corrida ou reprocessamento.

Diretrizes:

- falhas de um item nao devem abortar toda a rodada sem necessidade;
- chamadas externas devem produzir log com contexto minimo;
- itens rejeitados devem registrar motivo;
- deve existir contagem de itens lidos, filtrados, criados e falhos por execucao.

## 14. Seguranca

- credenciais do DataJuri e do Trello nao devem ficar hardcoded em fluxos exportados para o repositorio;
- tokens e segredos devem ser armazenados em secrets do ambiente;
- logs nao devem expor access tokens;
- dados sensiveis do processo devem ser minimizados no card quando nao agregarem valor operacional.

## 15. Observabilidade

Minimo recomendado:

- log de inicio e fim da rodada;
- total de itens lidos por modulo;
- total de itens elegiveis;
- total de cards criados;
- total de erros;
- tempo total da execucao.

Indicadores de operacao:

- tempo medio por rodada;
- taxa de falha por modulo;
- quantidade de itens novos por periodo;
- backlog de itens rejeitados ou nao mapeados.

## 16. Decisoes tecnicas atuais

### 16.1 Decisoes tomadas

- o mecanismo inicial de captura sera polling, nao webhook;
- o intervalo inicial sera de 30 minutos;
- `Atividade` e a primeira entidade-alvo;
- o Trello e o destino operacional inicial;
- o material exploratorio atual em `n8n` serve como base de descoberta e nao como modelo final de producao.

### 16.2 Decisoes pendentes

- confirmar quais modulos entram no espelhamento definitivo;
- definir o criterio correto de "novo" item;
- escolher a persistencia de deduplicacao de producao;
- decidir se a implementacao final permanece em `n8n` ou migra para servico dedicado;
- definir modelo de board/lista no Trello;
- decidir se havera sincronizacao de atualizacao e conclusao.

## 17. Roadmap recomendado

### Fase 1 - Descoberta funcional

- mapear com clareza `Atividade`, `Tarefa` e `Compromisso`;
- listar campos de cada modulo;
- identificar quais itens realmente representam trabalho operacional no Trello;
- validar filtros de consulta.

### Fase 2 - Prova de conceito controlada

- espelhar apenas `Atividade`;
- usar uma lista de teste no Trello;
- validar titulacao, descricao e vencimento;
- medir duplicidade e ruido operacional.

### Fase 3 - Producao minima

- persistir deduplicacao fora da memoria;
- externalizar configuracao e segredos;
- adicionar logs e metricas;
- formalizar retry e tratamento de erro.

### Fase 4 - Evolucao

- suportar multiplos modulos com regras distintas;
- reconciliacao de atualizacoes;
- fechamento ou movimentacao automatica de cards;
- dashboards operacionais.

## 18. Criterios de aceite da primeira entrega

- autenticar no DataJuri com sucesso;
- consultar o modulo `Atividade`;
- identificar itens elegiveis de acordo com regra acordada;
- criar cards no Trello com informacoes essenciais;
- nao duplicar o mesmo item em rodadas subsequentes;
- produzir logs suficientes para auditoria basica.

## 19. Riscos

- ambiguidade funcional entre `Atividade`, `Tarefa` e `Compromisso`;
- ausencia de webhook, exigindo polling e controle fino de janela temporal;
- schema variavel dos modulos no DataJuri;
- duplicidade por falta de persistencia robusta;
- hardcode de IDs de listas no fluxo exploratorio;
- exposicao acidental de credenciais em artefatos exportados.

## 20. Proximos passos imediatos

- confirmar com negocio o que deve ser considerado "atividade espelhavel";
- levantar os campos do modulo `Atividade` via endpoint de campos;
- definir o identificador canonico de deduplicacao;
- escolher se a versao de producao sera `n8n` endurecido ou servico dedicado;
- definir a estrutura do board Trello de destino;
- implementar a primeira versao restrita ao modulo `Atividade`.
