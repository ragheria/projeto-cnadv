# Proposta de Novos Projetos — CNADV

**Cliente:** Chrispim Nascimento Advogados  
**Data:** 28/05/2026  
**Elaborado por:** Raphael Gil Herneque

---

## Contexto — Automações já em produção

| Automação | Descrição | Implementação | Mensal |
|---|---|---|---|
| CNADV - Atividades → Trello | Busca atividades do DataJuri e cria cards no board CN - PRODUÇÃO JURÍDICA a cada minuto | R$ 1.850 | R$ 350 |

---

## Projeto 1 — Automação Playwright: Cadastro de Réu no DataJuri

### Descrição

Sempre que um card for movido para a lista **"Envio"** no Trello, o sistema identifica automaticamente o Réu (adverso) vinculado ao processo e o cadastra na ficha raiz do processo no DataJuri — sem intervenção manual.

### Problema resolvido

Atualmente o cadastro do Réu na ficha raiz do DataJuri é feito manualmente após o envio. A automação elimina essa etapa, garantindo consistência e agilidade no momento do envio.

### Como funciona

```
Card movido para "Envio" (webhook Trello)
        ↓
n8n extrai: ID do processo + nome do Réu (adverso)
        ↓
Chama serviço Playwright via HTTP
        ↓
Playwright: login DataJuri → abre processo → cadastra Réu na ficha raiz
```

### Tecnologias utilizadas

- **n8n** — orquestração do fluxo (webhook + chamada ao serviço)
- **Playwright** — automação de browser para interagir com o DataJuri
- **Node.js + Express** — microserviço API que encapsula o Playwright
- **Docker Swarm** — deploy do microserviço na infraestrutura existente

### Infraestrutura

Novo serviço Docker (`playwright-api`) deployado no Swarm, isolado da stack do n8n. O n8n se comunica com ele via HTTP interno, sem expor o serviço externamente.

### Premissas

- Login no DataJuri via e-mail e senha (sem 2FA)
- URL do processo já disponível na descrição do card Trello
- Nome do Réu (adverso) já disponível no card

### Ponto em aberto ⚠️

> Cadastrar o Réu na ficha raiz é **preencher um campo já existente** ou **abrir um modal/formulário separado de cadastro de pessoa**? Isso pode impactar o escopo e prazo.

### Valores

| Item | Valor |
|---|---|
| Setup infra (Docker Swarm, deploy, configuração) | R$ 600 |
| Script Playwright (login + navegação + cadastro Réu) | R$ 700 |
| Integração n8n (webhook Trello → gatilho → chamada) | R$ 300 |
| **Total implementação** | **R$ 1.600** |
| **Manutenção mensal** | **R$ 100/mês** |

### Prazo

**5–7 dias úteis** após confirmação do ponto em aberto acima e acesso ao DataJuri para desenvolvimento e testes.

---

## Projeto 2 — Rastreamento de Vida dos Cards + Relatórios PDF

### Descrição

Sistema de rastreamento da atividade dos cards no Trello, com coleta contínua de eventos e geração automática de relatório PDF **mensal** com os principais insights sobre produtividade e prazos do escritório.

### Problema resolvido

Atualmente não há visibilidade histórica sobre o desempenho das atividades: quais responsáveis entregam mais, quais tipos de atividade atrasam mais, onde os cards ficam parados. Os relatórios preenchem essa lacuna com dados concretos.

### Como funciona

```
[Webhook Trello — eventos em tempo real]
        ↓
[n8n normaliza e armazena cada evento]
        ↓
[Banco de dados — histórico completo de eventos]
        ↓
[Workflow agendado mensal]
        ↓
[Geração de relatório PDF]
        ↓
[Entrega por e-mail ou WhatsApp]
```

### Eventos rastreados

- Card criado
- Card movido entre listas (com timestamp → calcula tempo em cada lista)
- Label adicionada / removida
- Membro atribuído / removido
- Due date definida / alterada
- Card marcado como concluído
- Card arquivado

### Insights propostos para o relatório

**Produtividade**
- Total de cards concluídos no mês
- Concluídos por responsável (ranking)

**Prazos**
- % cards concluídos antes do due date
- % cards concluídos com atraso

**Fluxo e gargalos**
- Tempo médio que cards passam em cada lista
- Cards criados vs concluídos no mês (tendência)

### Formato dos relatórios

- **PDF** gerado automaticamente
- **Relatório mensal** — primeiro dia útil do mês

### Valores

| Item | Valor |
|---|---|
| Webhook + modelo de dados + storage | R$ 500 |
| Engine de relatório (cálculos + insights) | R$ 600 |
| Layout e geração do PDF mensal | R$ 300 |
| **Total implementação** | **R$ 1.400** |
| **Manutenção mensal** | **R$ 80/mês** |

### Prazo

**15–20 dias úteis** a partir do início do desenvolvimento.

---

## Resumo Geral — Todos os Projetos

### Implementação

| Projeto | Valor |
|---|---|
| ~~CNADV - Atividades → Trello~~ *(já entregue)* | ~~R$ 1.850~~ |
| CNADV - Arquiva Cards Concluídos | R$ 600 |
| Playwright + Cadastro Réu DataJuri | R$ 1.600 |
| Rastreamento de Cards + Relatórios PDF | R$ 1.400 |
| **Total novos projetos** | **R$ 3.600** |

### Manutenção mensal (recorrente)

| Automação | Mensal |
|---|---|
| CNADV - Atividades → Trello | R$ 350 |
| Playwright + Cadastro Réu DataJuri | R$ 100 |
| Rastreamento + Relatórios | R$ 80 |
| **Total mensal** | **R$ 530/mês** |

---

## Cronograma

```
Semana 1  →  Playwright: infra Docker + script DataJuri + integração n8n
Semana 2  →  Rastreamento: webhook + modelo de dados + importação histórico
Semana 3  →  Relatórios: engine de cálculo + layout PDF semanal/mensal + testes
```

**Início estimado:** mediante aprovação do orçamento e acesso ao DataJuri para desenvolvimento.

---

## Condições comerciais (sugestão)

- Pagamento da implementação: 50% no início + 50% na entrega
- Manutenção mensal: cobrada no início de cada mês
- Ajustes pós-entrega: até 7 dias de garantia incluídos
- Alterações de escopo após início: orçadas separadamente
