import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

// Mismo orden que ConfigModule: api/.env y luego el .env de la raiz del repo
const ENV_FILES = [
  resolve(__dirname, '../../../.env'),
  resolve(__dirname, '../../../../.env'),
];

/**
 * Carga .env y redirige DB_DATABASE a la base de tests, para que todo lo que
 * lea la configuracion (databaseConfig, AppModule) use esa base.
 * Se exige el sufijo _test porque global-setup hace DROP DATABASE sobre ella.
 */
export function useTestDatabase(): string {
  // Como ConfigModule: lo ya definido en el entorno y el primer archivo ganan
  for (const file of ENV_FILES.filter((f) => existsSync(f))) {
    for (const [key, value] of Object.entries(parseEnv(readFileSync(file, 'utf8')))) {
      process.env[key] ??= value;
    }
  }
  const testDb = process.env.DB_TEST_DATABASE ?? 'pretrabajo_test';
  if (!/^\w+_test$/.test(testDb)) {
    throw new Error(
      `DB_TEST_DATABASE="${testDb}" no es valido: debe terminar en _test y contener solo letras, numeros o _`,
    );
  }
  process.env.DB_DATABASE = testDb;
  return testDb;
}

// Se ejecuta como setupFiles en cada archivo de test
useTestDatabase();
