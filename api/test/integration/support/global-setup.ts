import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { useTestDatabase } from './test-env';

const SCHEMA_FILE = resolve(__dirname, '../../../../database/schema.sql');

/**
 * Se ejecuta una vez antes de todos los tests de integracion: recrea la base
 * de tests desde cero con database/schema.sql. Asi los tests usan siempre el
 * esquema actual y nunca tocan la base de desarrollo.
 */
export default async function globalSetup(): Promise<void> {
  const db = useTestDatabase();
  const appUser = process.env.DB_USERNAME;

  // Se usa root porque el usuario de la app no puede crear bases
  const conn = await createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: 'root',
    password: process.env.DB_ROOT_PASSWORD,
    multipleStatements: true,
  }).catch((error: Error) => {
    throw new Error(
      `No se pudo conectar a MySQL (${error.message}). Levanta el contenedor con: npm run db:up`,
    );
  });

  try {
    await conn.query(
      `DROP DATABASE IF EXISTS \`${db}\`;
       CREATE DATABASE \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
       GRANT ALL PRIVILEGES ON \`${db}\`.* TO ?@'%';
       USE \`${db}\`;`,
      [appUser],
    );
    await conn.query(readFileSync(SCHEMA_FILE, 'utf8'));
  } finally {
    await conn.end();
  }
}
