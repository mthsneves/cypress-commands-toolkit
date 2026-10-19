# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-10-19

### Adicionado
- **Estrutura Modular**: Separação completa da arquitetura em módulos (`commands.ts`, `auth.ts`, `dataGenerator.ts`, `apiSeeding.ts`, `reloadUntilVisible.ts`).
- **Comandos Customizados de UI e Resiliência**:
  - `waitForPageLoad`: espera ativa e resiliente até `document.readyState === 'complete'`.
  - `interactWithElement`: suporte unificado para ações com retry automático (`click`, `type`, `clear`, `mouseover`, `containsClick`, `containsSelectorClick`).
  - `clickWhenVisibleAndEnabled`: prevenção de cliques prematuros garantindo visibilidade e estado ativo (`not.be.disabled`).
  - `selectAutocomplete`: automação especializada para componentes dinâmicos (MUI, Ant Design, Select2).
  - `selectOptionWithText`: seleção baseada em listas `li` com escape automático.
  - `clickUntilVisible`: polling de clique com timeout e logs detalhados integrados ao runner do Cypress.
  - `validateTextInElement`: asserção múltipla sobre textos de um mesmo nó/linha.
  - `searchForm`: preenchimento declarativo baseado em schemas.
  - `getByTestId` e `getByDataCy`: seletores desacoplados de regras de CSS.
  - Comandos dinâmicos de input: `fillGeneratedEmail`, `fillGeneratedPhone`, `fillGeneratedName`, `fillGeneratedCPF`, `fillGeneratedCNPJ`.
- **Módulo de Autenticação Resiliente**:
  - `loginPlatform`: fluxo sequencial e determinístico com fallback automático para variáveis de ambiente (`USER_EMAIL` e `USER_PASSWORD`), detecção de modal de sessão ativa concorrente e captura de erros do backend.
  - `logout`: encerramento seguro com nova consulta ao DOM após abertura de menu e limpeza de armazenamento (`clearAllCookies` e `clearAllLocalStorage`).
- **DataGenerator**:
  - Geração de CPFs e CNPJs válidos (com e sem máscara), com proteção contra dígitos idênticos rejeitados pela Receita Federal.
  - Geração de e-mails únicos garantidos com hash e timestamp.
  - Geração de números de telefone e normalização de strings (`normalizeText`).
- **Helpers de API**:
  - `ApiHelper.loginViaAPI`: autenticação híbrida gravando o token diretamente no `window.localStorage` da aplicação com chave e endpoint configuráveis.
  - `ApiHelper.seedRecordViaAPI`: injeção rápida de massa de dados antes de testes de UI.
  - `reloadUntilVisible`: polling de recarregamento com suporte a validação de tooltips (`title`) e texto normalizado.
- **Suporte Multi-Ambiente**:
  - Carregamento dinâmico de variáveis via `.env.qa`, `.env.staging` e `.env.prod`.
  - Task Node `checkFileExists` resiliente com suporte ao `glob` v13 e tratamento de erros de diretório.
- **Testes de Fumaça (Smoke Tests)**:
  - Validação completa de todos os utilitários e comandos contra `https://example.cypress.io`.
