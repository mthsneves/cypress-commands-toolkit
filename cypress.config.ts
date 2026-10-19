import { defineConfig } from "cypress";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { globSync } from "glob";

// Carrega as variáveis do arquivo .env correspondente ao ambiente (ex: CYPRESS_ENV=qa)
const envTarget = process.env.CYPRESS_ENV || "qa";
const envPath = path.resolve(__dirname, `./cypress/config/.env.${envTarget}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Carrega .env raiz se disponível
  dotenv.config();
}

export default defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 60000,
  video: false,
  downloadsFolder: "cypress/downloads",
  retries: {
    runMode: 2, // Reexecuta até 2x em caso de falha no CI/CD
    openMode: 0,
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "https://example.cypress.io",
    env: {
      apiBaseUrl: process.env.CYPRESS_API_BASE_URL || "https://api.exemplo.com",
      ambiente: envTarget,
      USER_EMAIL: process.env.CYPRESS_USER_EMAIL || "",
      USER_PASSWORD: process.env.CYPRESS_USER_PASSWORD || "",
    },
    setupNodeEvents(on, config) {
      // Task do Node para validar se um arquivo baixado existe no disco
      on("task", {
        checkFileExists(filenamePattern: string): boolean {
          try {
            const downloadsFolder = config.downloadsFolder;
            if (!fs.existsSync(downloadsFolder)) {
              return false;
            }
            const searchPath = path.join(downloadsFolder, filenamePattern).replace(/\\/g, "/");
            const files = globSync(searchPath);
            return files.length > 0;
          } catch {
            return false;
          }
        },
      });
    },
  },
});
