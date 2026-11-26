import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Global para no tener que importarlo en cada modulo de feature
    ConfigModule.forRoot({
      isGlobal: true,
      // api/.env tiene prioridad; si no existe se usa el .env de la raiz del repo.
      // En Docker no hay archivo: las variables llegan desde docker-compose.
      envFilePath: ['.env', '../.env'],
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        config.getOrThrow<TypeOrmModuleOptions>('database'),
    }),
    ProductsModule,
  ],
})
export class AppModule {}
