import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // El esquema lo define database/schema.sql, TypeORM no debe modificarlo
    synchronize: false,
    autoLoadEntities: true,
    charset: 'utf8mb4',
    // MySQL del contenedor corre en UTC; sin esto mysql2 lee las fechas como
    // hora local y createdAt sale desplazado segun la zona del servidor de la API
    timezone: 'Z',
  }),
);
