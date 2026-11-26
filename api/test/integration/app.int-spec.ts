import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';

/**
 * Prueba de humo con la aplicacion completa: AppModule real, ConfigModule,
 * TypeORM y MySQL. Verifica el cableado que los e2e en memoria no cubren.
 */
describe('AppModule con MySQL', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.get(DataSource).query('TRUNCATE TABLE products');
  });

  const http = () => request(app.getHttpServer());

  it('CRUD completo pasando por la base real', async () => {
    const created = await http()
      .post('/api/products')
      .send({ sku: 'SKU-1', name: 'Mesa 100% roble', price: 19.99 })
      .expect(201);
    expect(created.body).toMatchObject({ sku: 'SKU-1', price: 19.99, stock: 0 });

    await http()
      .post('/api/products')
      .send({ sku: 'SKU-1', name: 'Otra', price: 1 })
      .expect(409);

    await http()
      .post('/api/products')
      .send({ sku: 'SKU-2', name: 'Mesa 1000 pino', price: 5 })
      .expect(201);

    const search = await http().get('/api/products?q=100%25').expect(200);
    expect(search.body.items.map((p: { sku: string }) => p.sku)).toEqual(['SKU-1']);

    await http()
      .patch(`/api/products/${created.body.id}`)
      .send({ sku: 'SKU-2' })
      .expect(409);

    await http().delete(`/api/products/${created.body.id}`).expect(204);
    await http().get(`/api/products/${created.body.id}`).expect(404);
  });
});
