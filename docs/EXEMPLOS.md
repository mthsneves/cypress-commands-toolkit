# Exemplos Práticos de Uso do Cypress Master Automation Toolkit

Este guia apresenta cenários reais de ponta a ponta demonstrando como utilizar os comandos, utilitários e helpers do toolkit para criar testes resilientes, desacoplados e de fácil manutenção.

---

## 1. Cadastro com Geração Dinâmica de Dados e Autocomplete

Neste cenário, automatizamos um formulário de cadastro que exige dados únicos para evitar erros de duplicidade (como e-mail, CPF e CNPJ já cadastrados na base).

```typescript
describe("Cadastro de Clientes", () => {
  beforeEach(() => {
    cy.visit("/cadastro-cliente");
    cy.waitForPageLoad();
  });

  it("Deve cadastrar uma nova empresa sem colisão de dados no banco", () => {
    // 1. Preenchimento de campos utilizando geradores dinâmicos
    cy.fillGeneratedName("#txt-razao-social", "Loja Virtual");
    cy.fillGeneratedCNPJ("#txt-cnpj");
    cy.fillGeneratedEmail("#txt-email");
    cy.fillGeneratedPhone("#txt-celular");

    // 2. Interação com Autocomplete complexo (ex: Material-UI, Select2, Ant Design)
    cy.selectAutocomplete("#combo-cidade", "Curitiba", {
      type: true,
      waitTime: 1000,
    });

    // 3. Clique seguro aguardando que o botão esteja visível e habilitado
    cy.clickWhenVisibleAndEnabled("#btn-salvar");

    // 4. Validação do feedback de sucesso
    cy.interactWithElement(".toast-success", "containsClick");
    cy.validateTextInElement(".alert-area", ["Cadastro realizado com sucesso"]);
  });
});
```

---

## 2. Teste Híbrido (API Seeding + UI) com Validação de Download no Disco

O padrão híbrido acelera a suíte de testes: autentica e cria registros pesados diretamente via API (`cy.request`), acessando a interface gráfica apenas no ponto de interesse para realizar as validações de usuário final.

```typescript
import { ApiHelper } from "../support/helpers/apiSeeding";
import { DataGenerator } from "../support/utils/dataGenerator";

describe("Gestão de Pedidos (Padrão Híbrido)", () => {
  it("Deve aprovar um pedido injetado por API e validar o download do relatório", () => {
    const pedidoPayload = {
      numeroPedido: `PED_${DataGenerator.uniqueHash(6)}`,
      valorTotal: 1500.50,
      itens: [{ id: 1, quantidade: 2 }],
    };

    // 1. Autenticação direta via API e armazenamento do token no localStorage da aplicação
    ApiHelper.loginViaAPI("admin@empresa.com", "SenhaForte@123").then((token) => {
      // 2. Injeção de massa de dados diretamente no backend
      ApiHelper.seedRecordViaAPI("api/pedidos", pedidoPayload, token).then(() => {
        // 3. Acessa a UI já autenticado e diretamente na rota do pedido
        cy.visit(`/pedidos/${pedidoPayload.numeroPedido}`);
        cy.waitForPageLoad();

        // 4. Valida múltiplos dados da tela/tabela com um único comando
        cy.validateTextInElement(".pedido-detalhes", [
          pedidoPayload.numeroPedido,
          "R$ 1.500,50",
          "Pendente",
        ]);

        // 5. Aciona o download via seletor desacoplado
        cy.getByTestId("btn-exportar-pdf").click();

        // 6. Valida no sistema de arquivos do Node se o arquivo PDF foi baixado
        cy.task("checkFileExists", `*${pedidoPayload.numeroPedido}*.pdf`).should("be.true");
      });
    });
  });
});
```

---

## 3. Autenticação Resiliente com Tratamento de Sessões Concorrentes

Sistemas corporativos frequentemente bloqueiam múltiplos acessos ou exibem modais como *"Você já está conectado em outro dispositivo. Deseja forçar o login?"*. O comando `loginPlatform` gerencia esse comportamento de forma determinística.

```typescript
describe("Acesso Seguro à Plataforma", () => {
  it("Deve autenticar com fallback para variáveis de ambiente e derrubar sessões ativas", () => {
    // Caso credenciais não sejam passadas, o comando lê automaticamente
    // de Cypress.env("USER_EMAIL") e Cypress.env("USER_PASSWORD")
    cy.loginPlatform();

    // Validação da área logada
    cy.url().should("include", "/dashboard");
    cy.contains("Painel de Controle").should("be.visible");

    // Realiza logout seguro limpando cookies e localStorage
    cy.logout();
  });

  it("Deve autenticar em projetos com seletores ou rotas customizadas", () => {
    cy.loginPlatform("operador@empresa.com", "ChaveSecreta123!", {
      loginPath: "/entrar",
      emailSelector: 'input[name="usuario"]',
      passwordSelector: 'input[name="senha"]',
      submitSelector: 'button[type="submit"]',
      confirmModalSelector: "#btn-desconectar-outros-dispositivos",
      errorMessageSelector: ".feedback-alerta",
      timeout: 45000,
    });
  });
});
```

---

## 4. Espera Ativa por Jobs Assíncronos (`reloadUntilVisible` e `clickUntilVisible`)

Em fluxos que dependem de processamento em segundo plano (como filas de mensageria, geração de notas fiscais ou relatórios), os utilitários de polling evitam waits arbitrários (`cy.wait(5000)`).

```typescript
import { reloadUntilVisible } from "../support/helpers/reloadUntilVisible";

describe("Processamento em Fila", () => {
  it("Deve aguardar o processamento de um lote atualizando a tela periodicamente", () => {
    cy.visit("/fila-processamento");

    // Recarrega a página a cada 5 segundos até o texto 'Processado com Sucesso' surgir
    reloadUntilVisible(".badge-status", "Processado com Sucesso", {
      maxAttempts: 10,
      intervalMs: 5000,
      initialWaitMs: 2000,
      clickWhenVisible: false,
    });
  });

  it("Deve clicar repetidamente no botão de sincronização até o item aparecer", () => {
    cy.visit("/notificacoes");

    // Clica no botão de sincronizar até que o item esperado seja renderizado
    cy.clickUntilVisible(".item-notificacao-novo", "#btn-sincronizar-lista", {
      timeout: 20000,
      interval: 2000,
    });
  });
});
```

---

## 5. Preenchimento Declarativo de Filtros de Busca (`searchForm`)

Para telas de filtros ou relatórios complexos com múltiplos campos de texto e selects dinâmicos:

```typescript
describe("Consulta de Faturas", () => {
  it("Deve aplicar múltiplos filtros através de schema declarativo", () => {
    cy.visit("/financeiro/faturas");

    cy.searchForm({
      fields: [
        { selector: "#txt-cliente", value: "Matheus Neves" },
        { selector: "#txt-competencia", value: "10/2026" },
        { selector: "#combo-status", value: "Liquidada", useOptionIndex: true },
      ],
      btns: ["#btn-aplicar-filtros", "#btn-confirmar"],
    });

    cy.get(".tabela-faturas").should("contain.text", "Matheus Neves");
  });
});
```
