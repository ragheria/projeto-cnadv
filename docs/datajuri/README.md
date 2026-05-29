# DataJuri API

Esta pasta guarda a collection do Postman usada como referência de integração com a API do DataJuri.

## Arquivos

- `DataJuri API.postman_collection.json`: collection exportada do Postman, versionada no projeto.

## Como usar

1. Importe a collection no Postman.
2. Configure a variável `host` com a base URL da API do DataJuri.
3. Gere o token em `Autenticação > Gerar token de acesso`.
4. Use o `Bearer {{token}}` nas demais requisições da collection.

## Escopo documentado

- `Autenticação`
  - Geração de token de acesso via `POST /oauth/token`
- `Sistema`
  - Lista de módulos
  - Lista de campos por módulo
- `Entidades`
  - Lista de entidades por módulo
  - Total de registros por módulo
- `Processo`
  - Instâncias por número CNJ
  - Novo processo temporário
  - Consulta de processo por CNJ
  - Data da última consulta com sucesso
  - Últimos andamentos encontrados
  - Resumo do processo
  - Exclusão de processo por CNJ

## Observações

- A collection original contém descrições detalhadas de headers, parâmetros e exemplos de uso.
- Se o arquivo tiver sido exportado com encoding inconsistente no sistema de origem, prefira validar a visualização dentro do Postman.
