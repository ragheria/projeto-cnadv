# CNADV — Automações

Automações do escritório **Chrispim Nascimento Advogados** via n8n + Playwright.

## Workflows n8n

| Workflow | Descrição | Status |
|---|---|---|
| CNADV - Atividades → Trello | Busca atividades do DataJuri e cria cards no Trello a cada minuto | Produção |
| CNADV - Arquiva Cards Concluídos | Arquiva cards concluídos automaticamente | Produção |
| CNADV - Explorador DataJuri | Exploração e mapeamento da API DataJuri | Interno |

## Infraestrutura

```
Trello (webhook)
      ↓
n8n (orquestração)
      ↓
playwright-api (automação de browser)
      ↓
DataJuri (sistema alvo)
```

| Serviço | Repositório |
|---|---|
| n8n workflows | este repo — `prod-workflow/` |
| Automação Playwright | [ragheria/playwright-api](https://github.com/ragheria/playwright-api) |

## Deploy do Playwright

O `docker-compose.yml` na raiz deste repo é o stack do `playwright-api` no Docker Swarm. Deploy manual via Portainer.

Variáveis necessárias no Portainer:

| Variável | Descrição |
|---|---|
| `APP_VERSION` | Tag da imagem (ex: `v1.0.1`) |
| `DATAJURI_EMAIL` | Login DataJuri |
| `DATAJURI_PASSWORD` | Senha DataJuri |

## Estrutura

```
prod-workflow/cnadv/   ← workflows exportados do n8n
docker-compose.yml     ← stack playwright no Swarm
```
