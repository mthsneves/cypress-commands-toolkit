import { DataGenerator } from "../utils/dataGenerator";

export interface ReloadUntilVisibleOptions {
  maxAttempts?: number;
  intervalMs?: number;
  initialWaitMs?: number;
  clickWhenVisible?: boolean;
}

/**
 * 5.11. reloadUntilVisible (Função utilitária exportável)
 * Recarrega a página em intervalos até que um texto ou elemento apareça
 */
export function reloadUntilVisible(
  selector: string,
  expectedText: string,
  options: ReloadUntilVisibleOptions = {},
) {
  const {
    maxAttempts = 15,
    intervalMs = 10000,
    initialWaitMs = 5000,
    clickWhenVisible = false,
  } = options;

  if (initialWaitMs > 0) {
    cy.wait(initialWaitMs);
  }

  const attempt = (n: number) => {
    if (n > maxAttempts) {
      throw new Error(
        `"${expectedText}" não apareceu em "${selector}" após ${maxAttempts} tentativas de reload.`,
      );
    }

    cy.reload();
    cy.waitForPageLoad();
    cy.wait(intervalMs);

    cy.get("body").then(($body) => {
      const elements = $body.find(selector);

      // Checa por atributo title (tooltip ou texto truncado)
      const titleEl = $body.find(`[title="${expectedText}"]`);
      if (titleEl.length > 0 && titleEl.text().includes(expectedText)) {
        cy.log(`✅ "${expectedText}" encontrado via [title] na tentativa ${n}`);
        if (clickWhenVisible) {
          cy.wrap(titleEl).click({ force: true });
        }
        return;
      }

      if (elements.length === 0) {
        cy.log(`Tentativa ${n}/${maxAttempts}: seletor não renderizou`);
        attempt(n + 1);
        return;
      }

      const fullText = elements.text();

      if (
        DataGenerator.normalizeText(fullText).includes(
          DataGenerator.normalizeText(expectedText),
        )
      ) {
        cy.log(`✅ "${expectedText}" encontrado na tentativa ${n}`);
        if (clickWhenVisible) {
          cy.get(selector).click({ force: true });
        }
        return;
      }

      cy.log(`Tentativa ${n}/${maxAttempts}: aguardando "${expectedText}"...`);
      attempt(n + 1);
    });
  };

  attempt(1);
}
