// Dos proyectos para poder correrlos por separado (npm run test:unit / test:e2e).
// Ninguno necesita MySQL: los e2e usan InMemoryProductsRepository.
const base = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      ...base,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
    },
    {
      ...base,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
    },
  ],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
};
