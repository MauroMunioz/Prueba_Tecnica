import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configureApp } from '../../src/app.setup';
import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';
import { ProductsRepository } from '../../src/products/repositories/products.repository';
import { InMemoryProductsRepository } from './in-memory-products.repository';

/**
 * Arma la aplicacion HTTP real (controller, service, pipes globales) pero con
 * el repositorio en memoria. No importa AppModule ni ProductsModule porque
 * ambos cargan TypeORM y abririan una conexion a MySQL.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [ProductsController],
    providers: [
      ProductsService,
      { provide: ProductsRepository, useClass: InMemoryProductsRepository },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  // La misma configuracion que main.ts
  configureApp(app);
  await app.init();
  return app;
}
