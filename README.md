# Cypress Master Automation Toolkit 🚀

[![Cypress Version](https://img.shields.io/badge/cypress-16.2.0-04C38C.svg)](https://www.cypress.io/)
[![TypeScript](https://img.shields.io/badge/typescript-7.0.2-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Boilerplate e Toolkit Avançado de Automação Web com Cypress e TypeScript.**  
> Projetado para suportar aplicações modernas construídas em React, Vue, Angular e arquiteturas corporativas complexas.

---

## 📋 Sumário
- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Tabela Completa de Comandos Customizados](#tabela-completa-de-comandos-customizados)
- [Utilitários e Helpers](#utilitários-e-helpers)
  - [DataGenerator](#datagenerator)
  - [ApiHelper](#apihelper)
  - [reloadUntilVisible](#reloaduntilvisible)
- [Configuração de Ambientes Multi-.env](#configuração-de-ambientes-multi-env)
- [Como Utilizar Este Toolkit em Outro Projeto](#como-utilizar-este-toolkit-em-outro-projeto)
- [Decisões Técnicas e Arquitetura](#decisões-técnicas-e-arquitetura)
- [Boas Práticas de Automação](#boas-práticas-de-automação)
- [Licença](#licença)

---

## 🎯 Visão Geral

O **Cypress Master Automation Toolkit** fornece uma base sólida, altamente tipada e resiliente para projetos de automação de testes End-to-End. Ele elimina flaky tests comuns causados por animações, delays de renderização, modais concorrentes e dependência de dados estáticos.

### Principais Benefícios:
- **Resiliência Nativa**: comandos que aguardam visibilidade, estados habilitados e término de renderização antes de interagir.
- **Autenticação Concorrente Inteligente**: lida com modais de *"Usuário já conectado em outra sessão"* de forma determinística.
- **Massa de Dados Dinâmica**: geradores matematicamente válidos de CPF, CNPJ, Celular e E-mails únicos sem colisão.
- **Padrão Híbrido (API + UI)**: acelera suítes de teste efetuando login e seeding diretamente pelo backend (`cy.request`).
- **Totalmente Tipado**: autocomplete e validação rigorosa de tipos no VS Code / WebStorm via TypeScript.

---

## 🛠️ Pré-requisitos

- **Node.js**: versão `>= 18` (recomendado `>= 20.x`)
- **npm**: versão `>= 9.x`
- **Git**

---

## 🚀 Instalação e Configuração

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/<SEU_USUARIO>/cypress-master-toolkit.git
cd cypress-master-toolkit
npm install
```

### Scripts Disponíveis no `package.json`:

| Comando | Descrição |
|---|---|
| `npm run typecheck` | Executa a verificação estática de tipos TypeScript com `tsc --noEmit`. |
| `npm run cy:open` | Abre a interface interativa do Cypress Test Runner. |
| `npm run cy:run` | Executa os testes em modo headless no ambiente padrão (`qa`). |
| `npm run cy:run:qa` | Executa a suíte de testes apontando para o ambiente de QA. |
| `npm run cy:run:staging` | Executa a suíte de testes apontando para Staging/Homologação. |
| `npm run cy:run:prod` | Executa a suíte de testes apontando para Produção. |

---

## 📂 Estrutura de Pastas

```text
cypress-master-toolkit/
├── .gitignore
├── CHANGELOG.md
├── LICENSE
├── README.md
├── cypress.config.ts           <- Configuração dinâmica de .env e Tasks Node
├── package.json
├── tsconfig.json
├── docs/
│   └── EXEMPLOS.md             <- Exemplos de uso prático dos comandos e padrões
└── cypress/
    ├── config/
    │   ├── .env.example        <- Modelo versionado das variáveis de ambiente
    │   ├── .env.qa             <- Variáveis de QA (ignorado pelo git)
    │   ├── .env.staging        <- Variáveis de Staging (ignorado pelo git)
    │   └── .env.prod           <- Variáveis de Produção (ignorado pelo git)
    ├── downloads/              <- Diretório para validação de downloads de arquivos
    ├── e2e/
    │   └── smoke/
    │       ├── commands.cy.ts  <- Smoke tests de comandos de UI e resiliência
    │       └── dataGenerator.cy.ts <- Smoke tests de validações matemáticas de dados
    ├── fixtures/               <- Massas de dados estáticas (JSON, CSV, etc.)
    └── support/
        ├── e2e.ts              <- Ponto de entrada do Cypress (carrega commands e auth)
        ├── index.d.ts          <- Declaração global das tipagens TypeScript
        ├── commands.ts         <- Implementação de comandos customizados de UI
        ├── auth.ts             <- Autenticação resiliente (loginPlatform & logout)
        ├── helpers/
        │   ├── apiSeeding.ts   <- Autenticação via API e criação de massa pré-teste
        │   └── reloadUntilVisible.ts <- Polling de recarregamento para jobs assíncronos
        └── utils/
            └── dataGenerator.ts <- Geradores de CPF, CNPJ, Celular, E-mail e Hash
```

---

## 📑 Tabela Completa de Comandos Customizados

Todos os comandos estão registrados no namespace global `cy` e contam com autocomplete nativo em TypeScript:

| Comando | Assinatura | Descrição | Exemplo de Uso |
|---|---|---|---|
| **`waitForPageLoad`** | `waitForPageLoad(): Chainable<void>` | Aguarda até que o DOM esteja completamente carregado (`document.readyState === 'complete'`). | `cy.waitForPageLoad();` |
| **`interactWithElement`** | `interactWithElement(selector, action, options?, waitTime?): Chainable<void>` | Interage com elementos lidando com animações e força de clique automático. Suporta: `'click'`, `'type'`, `'clear'`, `'mouseover'`, `'containsClick'`, `'containsSelectorClick'`. | `cy.interactWithElement('#btn-salvar', 'click');`<br>`cy.interactWithElement('#txt-nome', 'type', { text: 'Carlos' });` |
| **`clickWhenVisibleAndEnabled`** | `clickWhenVisibleAndEnabled(selector, timeout?, options?): Chainable<void>` | Clica em um elemento garantindo previamente que esteja visível e habilitado (`not.be.disabled`). | `cy.clickWhenVisibleAndEnabled('#btn-confirmar');` |
| **`selectAutocomplete`** | `selectAutocomplete(selector, value, options?): Chainable<void>` | Seleciona opções em componentes dinâmicos de autocomplete (Material-UI, Ant Design, Select2). | `cy.selectAutocomplete('#combo-cidade', 'Curitiba', { type: true });` |
| **`selectOptionWithText`** | `selectOptionWithText(selector, text, waitTime?): Chainable<void>` | Abre dropdown e clica em item `<li>` com o texto informado, enviando `{esc}` para fechar o menu. | `cy.selectOptionWithText('#menu-opcoes', 'Excluir Item');` |
| **`clickUntilVisible`** | `clickUntilVisible(targetSelector, clickSelector, options?): Chainable<void>` | Clica repetidamente em um botão de ação até que o elemento alvo apareça em tela (polling com timeout configurável). | `cy.clickUntilVisible('.badge-sucesso', '#btn-atualizar', { timeout: 20000 });` |
| **`validateTextInElement`** | `validateTextInElement(selector, expectedTexts, options?, waitTime?): Chainable<void>` | Valida múltiplos textos de uma vez dentro de um elemento ou linha de tabela de forma determinística. | `cy.validateTextInElement('.pedido-row', ['PED-102', 'R$ 150,00', 'Aprovado']);` |
| **`searchForm`** | `searchForm(params): Chainable<void>` | Preenchimento declarativo de formulários e filtros de busca por schema de seletores e valores. | `cy.searchForm({ fields: [{ selector: '#txt-busca', value: 'Alpha' }], btns: ['#btn-filtrar'] });` |
| **`getByTestId`** | `getByTestId(testId, options?): Chainable<JQuery<HTMLElement>>` | Localizador desacoplado baseado no atributo padrão `[data-testid="..."]`. | `cy.getByTestId('btn-exportar').click();` |
| **`getByDataCy`** | `getByDataCy(dataCy, options?): Chainable<JQuery<HTMLElement>>` | Localizador desacoplado baseado no atributo padrão `[data-cy="..."]`. | `cy.getByDataCy('input-busca').type('Cypress');` |
| **`fillGeneratedEmail`** | `fillGeneratedEmail(selector, options?): Chainable<void>` | Preenche o campo com um e-mail único gerado com timestamp e hash. | `cy.fillGeneratedEmail('#txt-email');` |
| **`fillGeneratedPhone`** | `fillGeneratedPhone(selector, options?): Chainable<void>` | Preenche o campo com um número de celular válido no formato brasileiro. | `cy.fillGeneratedPhone('#txt-telefone');` |
| **`fillGeneratedName`** | `fillGeneratedName(selector, prefix?, options?): Chainable<void>` | Preenche o campo com um nome comercial ou de pessoa física aleatório. | `cy.fillGeneratedName('#txt-razao-social', 'Fornecedor');` |
| **`fillGeneratedCPF`** | `fillGeneratedCPF(selector, options?): Chainable<void>` | Preenche o campo com um CPF válido gerado na hora com cálculo real de dígitos verificadores. | `cy.fillGeneratedCPF('#txt-cpf');` |
| **`fillGeneratedCNPJ`** | `fillGeneratedCNPJ(selector, options?): Chainable<void>` | Preenche o campo com um CNPJ válido gerado na hora com cálculo real de dígitos verificadores. | `cy.fillGeneratedCNPJ('#txt-cnpj');` |
| **`loginPlatform`** | `loginPlatform(email?, password?, options?): Chainable<void>` | Autenticação resiliente com fallback para variáveis de ambiente, detecção de modal de sessão ativa e asserção de URL. | `cy.loginPlatform();`<br>`cy.loginPlatform('usuario@empresa.com', 'Senha123');` |
| **`logout`** | `logout(options?): Chainable<void>` | Realiza o logout consultando o DOM atualizado após abrir o menu do usuário e limpa todos os cookies e localStorage. | `cy.logout();` |

---

## 🧰 Utilitários e Helpers

### DataGenerator (`cypress/support/utils/dataGenerator.ts`)
Fornece funções utilitárias puras para geração de massas sem efeitos colaterais:
- `DataGenerator.uniqueHash(length = 6)`: string alfanumérica única baseada em timestamp e hash aleatório.
- `DataGenerator.email(prefix = "teste")`: gera e-mails únicos garantidos (ex: `teste_1729364400000_a1b2@automacao.com`).
- `DataGenerator.cellphone(mask = false)`: gera celulares válidos com DDD 11 (ex: `11987654321` ou `(11) 98765-4321`).
- `DataGenerator.cpf(mask = false)`: gera CPFs com algoritmo real da Receita Federal e proteção contra números repetidos (ex: `111.111.111-11`).
- `DataGenerator.cnpj(mask = false)`: gera CNPJs válidos com padrão de filial `0001` e cálculo estrito dos dois dígitos verificadores.
- `DataGenerator.normalizeText(text)`: remove acentos, caracteres diacríticos e espaços duplicados (ex: `"  Ação   Éxito "` $\rightarrow$ `"acao exito"`).

### ApiHelper (`cypress/support/helpers/apiSeeding.ts`)
Facilita o padrão de automação híbrida:
- `ApiHelper.loginViaAPI(username, password, storageKey = "authToken", loginEndpoint = "/api/v1/auth/login")`: efetua a requisição `POST`, valida status 200 e salva o token de acesso no `localStorage` do contexto da aplicação.
- `ApiHelper.seedRecordViaAPI(endpoint, payload, token?)`: realiza `POST` na API do backend injetando registros antes da execução da interface.

### reloadUntilVisible (`cypress/support/helpers/reloadUntilVisible.ts`)
Função para polling de páginas que dependem de processamento assíncrono. Suporta busca por texto normalizado e detecção de tooltips com atributo `[title]`:
```typescript
import { reloadUntilVisible } from "../support/helpers/reloadUntilVisible";

reloadUntilVisible(".status-badge", "Concluído", {
  maxAttempts: 12,
  intervalMs: 5000,
  initialWaitMs: 3000,
  clickWhenVisible: true,
});
```

---

## 🌐 Configuração de Ambientes Multi-.env

O toolkit gerencia múltiplos ambientes através da biblioteca `dotenv` e da variável de ambiente `CYPRESS_ENV`.

### 1. Crie seu arquivo de ambiente local a partir do exemplo:
```bash
cp cypress/config/.env.example cypress/config/.env.qa
```

### 2. Configure os parâmetros necessários:
```properties
CYPRESS_BASE_URL=https://qa.suaempresa.com.br
CYPRESS_API_BASE_URL=https://api-qa.suaempresa.com.br
CYPRESS_USER_EMAIL=usuario.qa@empresa.com
CYPRESS_USER_PASSWORD=SenhaSegura123!
```

Para alternar entre ambientes, utilize os scripts correspondentes que usam `cross-env` para compatibilidade entre Windows, macOS e Linux:
- `npm run cy:run:qa` $\rightarrow$ Carrega `cypress/config/.env.qa`
- `npm run cy:run:staging` $\rightarrow$ Carrega `cypress/config/.env.staging`
- `npm run cy:run:prod` $\rightarrow$ Carrega `cypress/config/.env.prod`

> [!IMPORTANT]
> Arquivos `.env.*` contendo credenciais reais são ignorados pelo `.gitignore`. Apenas o `.env.example` é versionado no repositório.

---

## 📦 Como Utilizar Este Toolkit em Outro Projeto

Para incorporar os comandos e resiliência deste toolkit em um projeto Cypress existente:

1. **Instale as dependências necessárias**:
   ```bash
   npm i -D dotenv glob cross-env
   ```
2. **Copie a pasta de suporte**:
   Copie todo o conteúdo de `cypress/support/` para a pasta `cypress/support/` do seu projeto.
3. **Configure as tipagens no `tsconfig.json`**:
   Certifique-se de que o `cypress/support/index.d.ts` esteja coberto pelo `include` do seu `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "types": ["cypress", "node"]
     },
     "include": ["cypress/**/*.ts", "cypress.config.ts"]
   }
   ```
4. **Adicione a Node Task no `cypress.config.ts`**:
   Copie a task `checkFileExists` e o carregador dinâmico de `dotenv` para o seu `cypress.config.ts`.
5. **Crie os arquivos `.env.*`** na pasta `cypress/config/` a partir do modelo `.env.example`.

---

## ⚖️ Decisões Técnicas e Arquitetura

Durante a modularização do código de referência, aplicamos correções arquiteturais essenciais:

1. **TypeScript 7 & Node Resolution**:
   No TypeScript 7, a opção `moduleResolution: "node"` foi descontinuada. Configuramos o projeto com CommonJS moderno e estrito, garantindo compilação com zero warnings.
2. **Glob v13 na Node Task `checkFileExists`**:
   A API moderna do `glob` exporta `{ globSync }`. A task trata diretórios inexistentes sem lançar exceções e normaliza barras de caminho para compatibilidade nativa com o Windows.
3. **Tipagem Global do `Cypress.env`**:
   Para resolver a ausência de tipagem da chamada estática `Cypress.env` no Cypress 16, a interface `Cypress` foi estendida no arquivo `cypress/support/index.d.ts`.
4. **Correção de Contexto no `ApiHelper.loginViaAPI`**:
   O código original tentava gravar em `window.localStorage` no contexto do Node/Runner do Cypress. O helper foi corrigido para utilizar `cy.window().then(win => win.localStorage.setItem(...))`, persistindo o token na janela real da aplicação sob teste.
5. **Atualização do DOM no `logout`**:
   Ao clicar no botão de usuário para abrir o menu dropdown, o DOM é renderizado dinamicamente. O toolkit refaz a busca com `cy.get("body").then(...)` após a abertura do menu, garantindo que o botão de logout seja localizado com sucesso.
6. **Robustez no `validateTextInElement`**:
   Eliminou-se o encadeamento frágil com `cy.wrap()` dentro de loops assíncronos. A validação agora utiliza uma única consulta determinística asserindo todos os textos via `expect($el.text()).to.contain(...)`.
7. **Detecção e Sequenciamento no `loginPlatform`**:
   O polling foi reestruturado de forma sequencial com limite configurável de tentativas, permitindo fallback transparente para variáveis de ambiente quando nenhum parâmetro é informado.

---

## 💡 Boas Práticas de Automação

- **Evite `force: true` indiscriminado**: prefira investigar e resolver sobreposições de elementos ou aguardar o término de animações com `waitForPageLoad()` ou `clickWhenVisibleAndEnabled()`. Use `force: true` apenas em casos pontuais onde bibliotecas externas (como Material UI ou formulários customizados com overlays) ocultam intencionalmente os inputs nativos.
- **Dê preferência a `data-testid` e `data-cy`**: seletores baseados em classes CSS e estruturas de layout são frágeis a alterações visuais. Seletores desacoplados garantem testes duráveis.
- **Acelere testes com API Seeding**: não utilize a interface gráfica para cadastrar dados prévios a menos que o teste seja especificamente sobre a tela de cadastro. Utilize `ApiHelper.seedRecordViaAPI` para criar pedidos, clientes e produtos via backend em milissegundos.
- **Isole a massa de teste**: nunca utilize CPFs, nomes ou e-mails estáticos em testes de escrita. Use os geradores do `DataGenerator` para garantir isolamento e permitir execução paralela sem colisões de unicidade.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

Autor: **Matheus Neves**
