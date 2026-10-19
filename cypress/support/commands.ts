import { DataGenerator } from "./utils/dataGenerator";

/**
 * 5.1. Espera a página carregar por completo
 */
Cypress.Commands.add("waitForPageLoad", () => {
  cy.window({ log: false }).then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.document.readyState === "complete") {
        resolve();
      } else {
        win.addEventListener("load", () => resolve());
      }
    });
  });
});

/**
 * 5.2. interactWithElement
 * Executa ações com tratamento contra animações e force click automático
 */
Cypress.Commands.add(
  "interactWithElement",
  (
    selector: string,
    action: string,
    options: {
      text?: string;
      index?: number;
      eq?: number;
      force?: boolean;
      timeout?: number;
      [key: string]: any;
    } = {},
    waitTime: number = 0,
  ) => {
    const defaultOptions = {
      timeout: 30000,
      force: true,
      eq: 0,
      ...options,
    };

    const { eq } = defaultOptions;

    switch (action) {
      case "click":
        cy.get(selector, defaultOptions).then((elements) => {
          cy.wrap(elements).eq(eq).click(defaultOptions);
        });
        break;

      case "mouseover":
        cy.get(selector, defaultOptions).then((elements) => {
          cy.wrap(elements).eq(eq).trigger("mouseover", defaultOptions);
        });
        break;

      case "type":
        if (defaultOptions.text === undefined) {
          throw new Error('A opção "text" é obrigatória para a ação "type".');
        }
        cy.get(selector, defaultOptions).then((elements) => {
          cy.wrap(elements).eq(eq).type(defaultOptions.text as string, defaultOptions);
        });
        break;

      case "clear":
        cy.get(selector, defaultOptions).then((elements) => {
          const $el = Cypress.$(elements).eq(eq);
          const $input = $el.is("input, textarea") ? $el : $el.find("input, textarea");
          cy.wrap($input).clear({ force: true });
        });
        break;

      case "containsClick":
        cy.contains(selector, defaultOptions).click(defaultOptions);
        break;

      case "containsSelectorClick":
        if (!defaultOptions.text) {
          throw new Error('A opção "text" é obrigatória para "containsSelectorClick".');
        }
        cy.contains(selector, defaultOptions.text, defaultOptions).click(defaultOptions);
        break;

      default:
        throw new Error(`Ação desconhecida: "${action}"`);
    }

    cy.waitForPageLoad();
    if (waitTime > 0) {
      cy.wait(waitTime);
    }
  },
);

/**
 * 5.3. clickWhenVisibleAndEnabled
 * Aguarda o elemento estar visível E não desabilitado antes do clique
 */
Cypress.Commands.add(
  "clickWhenVisibleAndEnabled",
  (selector: string, timeout: number = 30000, options: { force?: boolean } = {}) => {
    cy.waitForPageLoad();

    if (options.force) {
      cy.get(selector, { timeout })
        .should("exist")
        .eq(0)
        .click({ force: true });
    } else {
      cy.get(selector, { timeout })
        .should("be.visible")
        .should("not.be.disabled")
        .eq(0)
        .click();
    }
  },
);

/**
 * 5.4. selectAutocomplete
 * Preenche e seleciona em dropdowns tipo Material UI, AntD, etc.
 */
Cypress.Commands.add(
  "selectAutocomplete",
  (
    selector: string,
    value: string,
    options: { type?: boolean; waitTime?: number } = {},
  ) => {
    const { type = false, waitTime = 1500 } = options;

    if (type) {
      cy.get(selector, { timeout: 30000 })
        .should("be.visible")
        .click({ force: true })
        .clear({ force: true })
        .type(value, { force: true, delay: 50 });
      cy.wait(waitTime);
      cy.get('[role="option"]', { timeout: 15000 })
        .contains(value, { matchCase: false })
        .click({ force: true });
    } else {
      cy.get(selector, { timeout: 30000 })
        .should("be.visible")
        .click({ force: true });
      cy.wait(waitTime);
      cy.get('[role="option"]', { timeout: 15000 })
        .contains(value, { matchCase: false })
        .click({ force: true });
    }
  },
);

/**
 * 5.5. selectOptionWithText
 * Seleciona itens em listas baseadas na tag <li>
 */
Cypress.Commands.add(
  "selectOptionWithText",
  (selector: string, text: string, waitTime: number = 1000) => {
    cy.get(selector).click({ force: true });
    cy.contains("li", text).click({ force: true });
    cy.focused().type("{esc}");
    if (waitTime > 0) {
      cy.wait(waitTime);
    }
  },
);

/**
 * 5.6. clickUntilVisible
 * Tenta clicar em um botão repetidamente até o elemento alvo surgir
 */
Cypress.Commands.add(
  "clickUntilVisible",
  (
    targetSelector: string,
    clickSelector: string,
    options: { timeout?: number; interval?: number } = {},
  ) => {
    const { timeout = 15000, interval = 1000 } = options;
    const start = Date.now();

    function clickLoop() {
      cy.get("body").then(($body) => {
        if ($body.find(targetSelector).is(":visible")) {
          cy.log(`Elemento "${targetSelector}" está visível.`);
          return;
        }

        const elapsed = Date.now() - start;
        if (elapsed > timeout) {
          const errMsg = `Timeout: "${targetSelector}" não apareceu após ${timeout}ms.`;
          cy.log(`❌ ${errMsg}`);
          throw new Error(errMsg);
        }

        if ($body.find(clickSelector).length > 0) {
          cy.get(clickSelector, { timeout })
            .should("be.visible")
            .click({ force: true });
          cy.wait(interval);
          clickLoop();
        } else {
          const errMsg = `Botão de clique "${clickSelector}" não foi encontrado.`;
          cy.log(`❌ ${errMsg}`);
          throw new Error(errMsg);
        }
      });
    }

    clickLoop();
  },
);

/**
 * 5.7. validateTextInElement
 * Valida múltiplos textos de uma vez num mesmo elemento ou linha
 */
Cypress.Commands.add(
  "validateTextInElement",
  (
    selector: string,
    expectedTexts: string[] = [],
    options: { eq?: number; timeout?: number; [key: string]: any } = {},
    waitTime: number = 0,
  ) => {
    const defaultOptions = {
      timeout: 30000,
      eq: 0,
      ...options,
    };

    const { eq } = defaultOptions;

    cy.get(selector, defaultOptions)
      .eq(eq)
      .then(($el) => {
        expectedTexts.forEach((text) => {
          expect($el.text()).to.contain(text);
        });
      });

    if (waitTime > 0) {
      cy.wait(waitTime);
    }
  },
);

/**
 * 5.8. searchForm
 * Preenchimento declarativo orientado a schema para filtros de pesquisa
 */
Cypress.Commands.add(
  "searchForm",
  (params: {
    fields?: {
      selector: string;
      value?: string;
      useOptionIndex?: boolean;
    }[];
    btns?: string[];
  }) => {
    const { fields, btns } = params;
    cy.waitForPageLoad();

    if (fields?.length) {
      fields.forEach((field) => {
        if (field.value !== undefined && field.value !== null) {
          cy.get(field.selector, { timeout: 30000 })
            .should("be.visible")
            .clear({ force: true })
            .type(field.value, { force: true });

          if (field.useOptionIndex) {
            cy.get('[role="option"], li[data-option-index]', { timeout: 10000 })
              .first()
              .click({ force: true });
          }
        }
      });
    }

    if (btns?.length) {
      btns.forEach((btnSelector) => {
        cy.get(btnSelector, { timeout: 30000 })
          .should("be.visible")
          .should("not.be.disabled")
          .click({ force: true });
      });
    }
  },
);

/**
 * 5.9. Seletores Rápidos e Desacoplados
 */
Cypress.Commands.add("getByTestId", (testId: string, options = {}) => {
  return cy.get(`[data-testid="${testId}"]`, options);
});

Cypress.Commands.add("getByDataCy", (dataCy: string, options = {}) => {
  return cy.get(`[data-cy="${dataCy}"]`, options);
});

/**
 * 5.10. Comandos para Inputs com Dados Aleatórios
 */
Cypress.Commands.add("fillGeneratedEmail", (selector: string, options = {}) => {
  const email = DataGenerator.email();
  cy.get(selector, { timeout: 30000 })
    .should("be.visible")
    .clear({ force: true })
    .type(email, { force: true, ...options });
});

Cypress.Commands.add("fillGeneratedPhone", (selector: string, options = {}) => {
  const phone = DataGenerator.cellphone();
  cy.get(selector, { timeout: 30000 })
    .should("be.visible")
    .clear({ force: true })
    .type(phone, { force: true, ...options });
});

Cypress.Commands.add("fillGeneratedName", (selector: string, prefix = "Empresa", options = {}) => {
  const name = `${prefix} ${DataGenerator.uniqueHash(5).toUpperCase()}`;
  cy.get(selector, { timeout: 30000 })
    .should("be.visible")
    .clear({ force: true })
    .type(name, { force: true, ...options });
});

Cypress.Commands.add("fillGeneratedCPF", (selector: string, options = {}) => {
  const cpf = DataGenerator.cpf();
  cy.get(selector, { timeout: 30000 })
    .should("be.visible")
    .clear({ force: true })
    .type(cpf, { force: true, ...options });
});

Cypress.Commands.add("fillGeneratedCNPJ", (selector: string, options = {}) => {
  const cnpj = DataGenerator.cnpj();
  cy.get(selector, { timeout: 30000 })
    .should("be.visible")
    .clear({ force: true })
    .type(cnpj, { force: true, ...options });
});
