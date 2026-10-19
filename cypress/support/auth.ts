/**
 * MÓDULO DE AUTENTICAÇÃO RESILIENTE (loginPlatform & logout)
 * Compatível com React, Angular, Vue e sistemas que possuem:
 * - Validação de formulários no front (React Hook Form, Formik)
 * - Modal de "Sessão já ativa / Deseja desconectar outros dispositivos?"
 * - Mensagens de erro de credenciais inválidas na tela
 */

export interface LoginOptions {
  loginPath?: string;              // Rota de login (default: '#/login' ou '/login')
  emailSelector?: string;          // Seletor do input de email/usuário
  passwordSelector?: string;       // Seletor do input de senha
  submitSelector?: string;         // Seletor do botão de Entrar/Sign In
  confirmModalSelector?: string;   // Seletor do botão "Continuar / Forçar Login" caso já esteja conectado
  errorMessageSelector?: string;   // Seletor de mensagem de erro (ex: credenciais inválidas)
  timeout?: number;                // Timeout máximo para o login
}

/**
 * Função exportável padrão (pode ser chamada como loginPlatform(...) ou cy.loginPlatform(...))
 */
export function loginPlatform(
  email?: string,
  password?: string,
  options: LoginOptions = {},
) {
  const {
    loginPath = "#/login",
    emailSelector = "#txt-login-email",
    passwordSelector = "#txt-login-password",
    submitSelector = "#btn-login-signin",
    confirmModalSelector = "#id-login-button-login",
    errorMessageSelector = "#txt-login-fail",
    timeout = 30000,
  } = options;

  // Fallback para variáveis de ambiente caso credenciais não sejam passadas diretamente
  const resolvedEmail = email || (Cypress.env("USER_EMAIL") as string) || "";
  const resolvedPassword = password || (Cypress.env("USER_PASSWORD") as string) || "";

  cy.log(`🔐 Tentativa de login para: ${resolvedEmail || "usuário padrão"}`);

  // 1. Limpeza de estado e navegação segura para a tela de login
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.visit(loginPath);
  cy.waitForPageLoad();

  // 2. Aguarda até que o input de email esteja realmente visível e pronto
  cy.get(emailSelector, { timeout })
    .should("be.visible")
    .should("not.be.disabled");

  // 3. Preenchimento de Email com garantia de valor fixado (evita que o React limpe)
  if (resolvedEmail) {
    cy.get(emailSelector, { timeout })
      .clear({ force: true })
      .type(resolvedEmail, { log: false, force: true })
      .should("have.value", resolvedEmail);
  }

  // 4. Preenchimento de Senha
  if (resolvedPassword) {
    cy.get(passwordSelector, { timeout })
      .should("be.visible")
      .should("not.be.disabled")
      .clear({ force: true })
      .type(resolvedPassword, { log: false, force: true });
  }

  // 5. Clique no botão de submissão
  cy.get(submitSelector, { timeout })
    .should("be.visible")
    .should("not.be.disabled")
    .eq(0)
    .click({ log: false, force: true });

  // 6. Polling Inteligente de Estado Pós-Clique:
  //    - Verifica se redirecionou com sucesso para fora de /login
  //    - Se aparecer modal de "Usuário já conectado", clica para derrubar a outra sessão
  //    - Se houver mensagem de erro do backend na tela, registra no log
  const cleanLoginPath = loginPath.replace("#", "");

  const checkLoginOutcome = (attempts = 0, maxAttempts = 20) => {
    if (attempts >= maxAttempts) {
      cy.log(`⚠️ Limite de ${maxAttempts} tentativas de polling de login atingido.`);
      return;
    }

    cy.wait(1000, { log: false });

    cy.url().then((url) => {
      // Se já saiu da rota de login, o login foi um sucesso!
      if (!url.includes(cleanLoginPath)) {
        return;
      }

      cy.get("body").then(($body) => {
        // Cenário A: Modal de confirmação de sessão ativa detectado
        const confirmBtn = $body.find(confirmModalSelector);
        if (confirmBtn.length > 0 && confirmBtn.is(":visible")) {
          cy.log("⚠️ Modal 'Usuário já conectado' detectado — forçando nova sessão");
          cy.wrap(confirmBtn).click({ force: true, log: false });
          return;
        }

        // Cenário B: Mensagem de erro de credenciais exibida na tela
        const errorMsg = $body.find(errorMessageSelector);
        if (errorMsg.length > 0 && errorMsg.is(":visible")) {
          cy.log(`❌ Erro exibido na tela de login: ${errorMsg.text().trim()}`);
        }

        // Caso ainda esteja em /login, tenta novamente até o limite de tentativas
        checkLoginOutcome(attempts + 1, maxAttempts);
      });
    });
  };

  checkLoginOutcome(0);

  // 7. Asserção final obrigatória: URL deve sair da tela de login
  cy.url({ timeout }).should("not.include", cleanLoginPath);
  cy.log("✅ Login realizado com sucesso!");
}

/**
 * Função de Logout limpa e segura
 */
export function logout(options: {
  userMenuSelector?: string;
  logoutBtnSelector?: string;
} = {}) {
  const {
    userMenuSelector = "#id-userLogout-btn-containerUser",
    logoutBtnSelector = "#id-userLogout-btn-logout",
  } = options;

  cy.log("🚪 Realizando logout...");

  cy.get("body").then(($body) => {
    // Se o menu do usuário existir na tela, clica e desloga
    if ($body.find(userMenuSelector).length > 0) {
      cy.get(userMenuSelector).eq(0).click({ force: true });
      cy.wait(500);

      // Nova consulta ao DOM após o menu ser aberto para garantir elemento atualizado
      cy.get("body").then(($newBody) => {
        if ($newBody.find(logoutBtnSelector).length > 0) {
          cy.get(logoutBtnSelector).eq(0).click({ force: true });
          cy.wait(1000);
        }
      });
    }
  });

  // Limpa cookies e dados da sessão para não vazar para o próximo teste
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.log("✅ Logout finalizado e armazenamento limpo.");
}

// ==============================================================================
// REGISTRO COMO COMANDOS CYPRESS (Cypress.Commands.add)
// ==============================================================================
Cypress.Commands.add("loginPlatform", (email, password, options) => {
  loginPlatform(email, password, options);
});

Cypress.Commands.add("logout", (options) => {
  logout(options);
});
