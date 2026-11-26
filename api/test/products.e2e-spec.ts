import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';

describe('Products (e2e)', () => {
  let app: INestApplication;

  // App nueva por test: cada uno arranca con el repositorio vacio
  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  const validProduct = {
    sku: 'SKU-001',
    name: 'Mesa de roble',
    price: 199.99,
    stock: 3,
  };

  describe('POST /api/products', () => {
    it('crea un producto valido y responde 201', async () => {
      const res = await http()
        .post('/api/products')
        .send({ ...validProduct, sku: '  SKU-001  ' })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.any(Number),
        sku: 'SKU-001',
        name: 'Mesa de roble',
        price: 199.99,
        stock: 3,
        createdAt: expect.any(String),
      });
    });

    it('responde 400 si price es 0', async () => {
      const res = await http()
        .post('/api/products')
        .send({ ...validProduct, price: 0 })
        .expect(400);

      expect(res.body.message).toEqual(['El precio debe ser mayor que 0']);
    });

    it('responde 400 si falta name', async () => {
      const { name: _omitido, ...sinNombre } = validProduct;

      const res = await http().post('/api/products').send(sinNombre).expect(400);

      expect(res.body.message).toEqual(['El nombre es obligatorio']);
    });

    it('responde 409 si el SKU ya existe', async () => {
      await http().post('/api/products').send(validProduct).expect(201);

      const res = await http()
        .post('/api/products')
        .send({ ...validProduct, name: 'Otro producto' })
        .expect(409);

      expect(res.body.message).toBe('Ya existe un producto con el SKU "SKU-001"');
    });
  });

  // null no equivale a "campo ausente": debe validarse y dar 400. Antes pasaba
  // la validacion y MySQL lo rechazaba (columnas NOT NULL) con un 500
  describe('null en el body', () => {
    it('POST con stock null responde 400', async () => {
      const res = await http()
        .post('/api/products')
        .send({ ...validProduct, stock: null })
        .expect(400);

      expect(res.body.message).toEqual(['El stock debe ser un numero entero']);
    });

    it.each([
      ['sku', 'El SKU es obligatorio'],
      ['name', 'El nombre es obligatorio'],
      ['price', 'El precio es obligatorio'],
      ['stock', 'El stock debe ser un numero entero'],
    ])('PATCH con %s null responde 400 y no modifica el producto', async (field, message) => {
      const mesa = await http().post('/api/products').send(validProduct).expect(201);

      const res = await http()
        .patch(`/api/products/${mesa.body.id}`)
        .send({ [field]: null })
        .expect(400);

      expect(res.body.message).toEqual([message]);
      const actual = await http().get(`/api/products/${mesa.body.id}`).expect(200);
      expect(actual.body).toEqual(mesa.body);
    });

    it('PATCH sin el campo sigue siendo valido (solo cambia lo enviado)', async () => {
      const mesa = await http().post('/api/products').send(validProduct).expect(201);

      const res = await http()
        .patch(`/api/products/${mesa.body.id}`)
        .send({ stock: 10 })
        .expect(200);

      expect(res.body).toEqual({ ...mesa.body, stock: 10 });
    });
  });

  describe('id inexistente', () => {
    it.each([
      ['GET', () => http().get('/api/products/999')],
      ['PATCH', () => http().patch('/api/products/999').send({ price: 10 })],
      ['DELETE', () => http().delete('/api/products/999')],
    ])('%s /api/products/999 responde 404', async (_method, send) => {
      const res = await send().expect(404);

      expect(res.body.message).toBe('No existe un producto con id 999');
    });
  });

  describe('flujo completo', () => {
    it('actualizar y luego eliminar se refleja en el listado', async () => {
      const mesa = await http().post('/api/products').send(validProduct).expect(201);
      await http()
        .post('/api/products')
        .send({ sku: 'SKU-002', name: 'Silla', price: 49.5 })
        .expect(201);

      // Actualizar: el listado muestra los valores nuevos
      await http()
        .patch(`/api/products/${mesa.body.id}`)
        .send({ name: 'Mesa de pino', price: 150 })
        .expect(200);

      const despuesDeActualizar = await http().get('/api/products').expect(200);
      expect(despuesDeActualizar.body).toHaveLength(2);
      expect(despuesDeActualizar.body[0]).toMatchObject({
        id: mesa.body.id,
        sku: 'SKU-001',
        name: 'Mesa de pino',
        price: 150,
        stock: 3,
      });

      // Eliminar: responde 204 sin cuerpo y desaparece del listado
      const borrado = await http()
        .delete(`/api/products/${mesa.body.id}`)
        .expect(204);
      expect(borrado.text).toBe('');

      const despuesDeEliminar = await http().get('/api/products').expect(200);
      expect(despuesDeEliminar.body).toHaveLength(1);
      expect(despuesDeEliminar.body[0].sku).toBe('SKU-002');

      await http().get(`/api/products/${mesa.body.id}`).expect(404);
    });
  });
});
