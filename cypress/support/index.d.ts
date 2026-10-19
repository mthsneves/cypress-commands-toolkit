/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Cypress {
      env(key?: string): any;
      env(key: string, value: any): void;
      env(object: Record<string, any>): void;
      env(): Record<string, any>;
    }

    interface Chainable<Subject = any> {
    /** Aguarda até que o DOM esteja completamente carregado */
    waitForPageLoad(): Chainable<void>;

    /**
     * Interage com elementos lidando com seletores complexos e delays
     * @param selector Seletor CSS ou texto (para containsClick)
     * @param action 'click' | 'type' | 'clear' | 'mouseover' | 'containsClick' | 'containsSelectorClick'
     * @param options { text?: string; index?: number; eq?: number; force?: boolean; timeout?: number; [key: string]: any }
     * @param waitTime Espera opcional em ms após a ação
     */
    interactWithElement(
      selector: string,
      action:
        | "click"
        | "type"
        | "clear"
        | "mouseover"
        | "containsClick"
        | "containsSelectorClick"
        | string,
      options?: {
        text?: string;
        index?: number;
        eq?: number;
        force?: boolean;
        timeout?: number;
        [key: string]: any;
      },
      waitTime?: number,
    ): Chainable<void>;

    /** Clica em um botão/elemento garantindo que está visível e habilitado (sem disabled) */
    clickWhenVisibleAndEnabled(
      selector: string,
      timeout?: number,
      options?: { force?: boolean },
    ): Chainable<void>;

    /** Seleciona opção em Autocomplete / Dropdown dinâmico (Material-UI, Ant Design, Select2) */
    selectAutocomplete(
      selector: string,
      value: string,
      options?: { type?: boolean; waitTime?: number },
    ): Chainable<void>;

    /** Seleciona elemento <li> dentro de um menu dropdown aberto */
    selectOptionWithText(
      selector: string,
      text: string,
      waitTime?: number,
    ): Chainable<void>;

    /** Clica repetidamente em um botão até que outro elemento apareça (polling de UI) */
    clickUntilVisible(
      targetSelector: string,
      clickSelector: string,
      options?: { timeout?: number; interval?: number },
    ): Chainable<void>;

    /** Valida múltiplos textos de uma vez dentro de um elemento/linha de tabela */
    validateTextInElement(
      selector: string,
      expectedTexts: string[],
      options?: { eq?: number; timeout?: number; [key: string]: any },
      waitTime?: number,
    ): Chainable<void>;

    /** Preenchimento declarativo de formulários por schema */
    searchForm(params: {
      fields?: {
        selector: string;
        value?: string;
        useOptionIndex?: boolean;
      }[];
      btns?: string[];
    }): Chainable<void>;

    /** Localizador limpo por atributo data-testid */
    getByTestId(
      testId: string,
      options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
    ): Chainable<JQuery<HTMLElement>>;

    /** Localizador limpo por atributo data-cy */
    getByDataCy(
      dataCy: string,
      options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
    ): Chainable<JQuery<HTMLElement>>;

    /** Preenche input com e-mail único gerado automaticamente */
    fillGeneratedEmail(
      selector: string,
      options?: Partial<Cypress.TypeOptions>,
    ): Chainable<void>;

    /** Preenche input com celular formatado gerado automaticamente */
    fillGeneratedPhone(
      selector: string,
      options?: Partial<Cypress.TypeOptions>,
    ): Chainable<void>;

    /** Preenche input com nome aleatório */
    fillGeneratedName(
      selector: string,
      prefix?: string,
      options?: Partial<Cypress.TypeOptions>,
    ): Chainable<void>;

    /** Preenche input com CPF válido gerado na hora */
    fillGeneratedCPF(
      selector: string,
      options?: Partial<Cypress.TypeOptions>,
    ): Chainable<void>;

    /** Preenche input com CNPJ válido gerado na hora */
    fillGeneratedCNPJ(
      selector: string,
      options?: Partial<Cypress.TypeOptions>,
    ): Chainable<void>;

    /**
     * Realiza o login na plataforma via interface com resiliência a sessões concorrentes
     * @param email E-mail ou usuário de acesso (fallback para Cypress.env("USER_EMAIL"))
     * @param password Senha (fallback para Cypress.env("USER_PASSWORD"))
     * @param options Configurações customizáveis de seletores e rotas
     */
    loginPlatform(
      email?: string,
      password?: string,
      options?: {
        loginPath?: string;
        emailSelector?: string;
        passwordSelector?: string;
        submitSelector?: string;
        confirmModalSelector?: string;
        errorMessageSelector?: string;
        timeout?: number;
      },
    ): Chainable<void>;

    /**
     * Realiza o logout do sistema e limpa cookies e localStorage
     */
    logout(options?: {
      userMenuSelector?: string;
      logoutBtnSelector?: string;
    }): Chainable<void>;
  }
}
}

export {};
