// Tests de integracion contra MySQL real (npm run test:int).
// Separados de jest.config.js para que npm test siga sin necesitar la base.

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  displayName: 'integration',
  testMatch: ['<rootDir>/test/integration/**/*.int-spec.ts'],
  globalSetup: '<rootDir>/test/integration/support/global-setup.ts',
  setupFiles: ['<rootDir>/test/integration/support/test-env.ts'],
  // Todos los archivos comparten la misma base: se ejecutan de a uno
  maxWorkers: 1,
};
