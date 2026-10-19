/**
 * Padrão Híbrido: Autenticação + Criação de Massa via API sem tocar na UI
 */
export const ApiHelper = {
  /**
   * Realiza login direto no backend via cy.request e armazena o token na sessão
   * @param username Usuário ou e-mail
   * @param password Senha de acesso
   * @param storageKey Chave do localStorage onde o token será armazenado (default: 'authToken')
   * @param loginEndpoint Endpoint da API para autenticação (default: '/api/v1/auth/login')
   */
  loginViaAPI: (
    username: string,
    password: string,
    storageKey: string = "authToken",
    loginEndpoint: string = "/api/v1/auth/login",
  ): Cypress.Chainable<string> => {
    const apiBaseUrl = Cypress.env("apiBaseUrl") || "";
    const url = loginEndpoint.startsWith("http")
      ? loginEndpoint
      : `${apiBaseUrl.replace(/\/$/, "")}/${loginEndpoint.replace(/^\//, "")}`;

    return cy
      .request({
        method: "POST",
        url,
        body: { username, password },
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        const token = (res.body.token || res.body.result?.token) as string;
        // Salva no localStorage da aplicação para que a interface já abra autenticada
        cy.window().then((win) => {
          win.localStorage.setItem(storageKey, token);
        });
        return cy.wrap(token);
      });
  },

  /**
   * Cria qualquer registro via API rapidamente antes do teste de interface
   * @param endpoint Endpoint da API
   * @param payload Objeto com os dados do registro
   * @param token Token de autorização opcional
   */
  seedRecordViaAPI: (
    endpoint: string,
    payload: any,
    token?: string,
  ): Cypress.Chainable<any> => {
    const apiBaseUrl = Cypress.env("apiBaseUrl") || "";
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${apiBaseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    return cy
      .request({
        method: "POST",
        url,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: payload,
      })
      .then((res) => {
        expect(res.status).to.be.oneOf([200, 201]);
        return res.body;
      });
  },
};
