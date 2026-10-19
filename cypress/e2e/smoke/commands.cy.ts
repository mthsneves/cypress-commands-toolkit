describe("Smoke Tests: Custom Commands & Resilience Toolkit", () => {
  beforeEach(() => {
    cy.visit("/commands/actions");
    cy.waitForPageLoad();
  });

  it("Valida waitForPageLoad", () => {
    cy.waitForPageLoad();
    cy.url().should("include", "/commands/actions");
  });

  it("Valida seletores getByDataCy e getByTestId", () => {
    // Como example.cypress.io não possui data-cy nativo no HTML estático,
    // associamos os atributos em runtime para validar que o comando seleciona o elemento com precisão.
    cy.get(".action-email")
      .invoke("attr", "data-cy", "input-email-cy")
      .invoke("attr", "data-testid", "input-email-testid");

    cy.getByDataCy("input-email-cy")
      .should("be.visible")
      .and("have.class", "action-email");

    cy.getByTestId("input-email-testid")
      .should("be.visible")
      .and("have.class", "action-email");
  });

  it("Valida clickWhenVisibleAndEnabled", () => {
    cy.clickWhenVisibleAndEnabled(".action-btn");
    // O botão da página de actions abre um popover quando clicado
    cy.get(".popover").should("be.visible");
  });

  it("Valida interactWithElement com type, clear, click e containsClick", () => {
    // Ação 'type'
    cy.interactWithElement(".action-email", "type", { text: "usuario.toolkit@automacao.com" });
    cy.get(".action-email").should("have.value", "usuario.toolkit@automacao.com");

    // Ação 'clear'
    cy.interactWithElement(".action-email", "clear");
    cy.get(".action-email").should("have.value", "");

    // Ação 'click'
    cy.interactWithElement(".action-btn", "click");
    cy.get(".popover").should("be.visible");

    // Ação 'containsClick'
    cy.interactWithElement("Click to toggle popover", "containsClick");
  });

  it("Valida validateTextInElement", () => {
    // Valida múltiplos textos de uma vez dentro do botão de ação
    cy.validateTextInElement(".action-btn", ["Click", "popover"]);

    // Valida textos no banner principal
    cy.validateTextInElement(".banner h1", ["Actions"]);
  });

  it("Valida comandos de preenchimento com dados gerados automaticamente", () => {
    // fillGeneratedEmail (input email)
    cy.fillGeneratedEmail(".action-email");
    cy.get(".action-email")
      .invoke("val")
      .should("match", /^teste_\d+_[a-z0-9]+@automacao\.com$/);

    // fillGeneratedName (input text geral para permitir espaços no nome gerado)
    cy.fillGeneratedName("#fullName1", "Cliente");
    cy.get("#fullName1")
      .invoke("val")
      .should("match", /^Cliente [A-Z0-9]+$/);

    // fillGeneratedCPF (input text)
    cy.fillGeneratedCPF("#couponCode1");
    cy.get("#couponCode1")
      .invoke("val")
      .should("match", /^\d{11}$/);

    // fillGeneratedCNPJ (input text)
    cy.fillGeneratedCNPJ("#description");
    cy.get("#description")
      .invoke("val")
      .should("match", /^\d{14}$/);
  });

  it("Valida a task Node checkFileExists para arquivo inexistente", () => {
    cy.task("checkFileExists", "relatorio-inexistente-12345.pdf").should("be.false");
  });
});
