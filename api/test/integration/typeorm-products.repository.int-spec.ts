import { DataSource, QueryFailedError } from 'typeorm';
import { Product } from '../../src/products/entities/product.entity';
import { DuplicateSkuError } from '../../src/products/errors/duplicate-sku.error';
import { Page } from '../../src/products/repositories/products.repository';
import { TypeOrmProductsRepository } from '../../src/products/repositories/typeorm-products.repository';
import { createTestDataSource } from './support/test-data-source';

describe('TypeOrmProductsRepository (MySQL)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmProductsRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource().initialize();
    repo = new TypeOrmProductsRepository(dataSource.getRepository(Product));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  // Tabla vacia antes de cada test; TRUNCATE tambien reinicia el AUTO_INCREMENT
  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE products');
  });

  describe('mapeo de columnas', () => {
    it('create devuelve id, stock por defecto y createdAt generados por la base', async () => {
      const created = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      expect(created).toMatchObject({ id: 1, sku: 'SKU-1', stock: 0 });
      expect(created.createdAt).toBeInstanceOf(Date);
    });

    it('price DECIMAL se lee como number sin perder los decimales', async () => {
      const { id } = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 1234567.89 });

      const found = await repo.findById(id);

      expect(typeof found?.price).toBe('number');
      expect(found?.price).toBe(1234567.89);
    });

    it('createdAt coincide con la hora actual (no hay desfase de zona horaria)', async () => {
      const { id } = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      const found = await repo.findById(id);
      const diffMs = Math.abs(found!.createdAt.getTime() - Date.now());

      // Margen amplio por diferencias de reloj entre Docker y el host;
      // un desfase de zona horaria seria de al menos una hora
      expect(diffMs).toBeLessThan(5 * 60 * 1000);
    });
  });

  describe('SKU unico (ER_DUP_ENTRY)', () => {
    it('create con un SKU existente lanza DuplicateSkuError', async () => {
      await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      const error = await repo
        .create({ sku: 'SKU-1', name: 'Otra', price: 5 })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(DuplicateSkuError);
      expect((error as DuplicateSkuError).sku).toBe('SKU-1');
    });

    it('la unicidad no distingue mayusculas (collation utf8mb4_unicode_ci)', async () => {
      await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      await expect(
        repo.create({ sku: 'sku-1', name: 'Otra', price: 5 }),
      ).rejects.toBeInstanceOf(DuplicateSkuError);
    });

    it('update con el SKU de otro producto lanza DuplicateSkuError', async () => {
      await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });
      const silla = await repo.create({ sku: 'SKU-2', name: 'Silla', price: 5 });

      await expect(repo.update(silla.id, { sku: 'SKU-1' })).rejects.toBeInstanceOf(
        DuplicateSkuError,
      );
    });

    it('update conservando el SKU propio funciona', async () => {
      const mesa = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      const updated = await repo.update(mesa.id, { sku: 'SKU-1', price: 20 });

      expect(updated).toMatchObject({ sku: 'SKU-1', price: 20 });
    });

    it('otros errores de MySQL no se traducen a DuplicateSkuError', async () => {
      // stock es INT UNSIGNED: en modo estricto MySQL rechaza un negativo
      const error = await repo
        .create({ sku: 'SKU-1', name: 'Mesa', price: 10, stock: -1 })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(QueryFailedError);
      expect(error).not.toBeInstanceOf(DuplicateSkuError);
    });
  });

  describe('findAll con filtro por nombre (LIKE)', () => {
    beforeEach(async () => {
      for (const [sku, name] of [
        ['A', 'Mesa 100% roble'],
        ['B', 'Mesa 1000 pino'],
        ['C', 'Silla_azul'],
        ['D', 'Sillas azul'],
        ['E', 'Caja !oferta'],
      ]) {
        await repo.create({ sku, name, price: 1 });
      }
    });

    const names = (page: Page<Product>) => page.items.map((p) => p.name);

    it('sin filtro devuelve todo ordenado por id', async () => {
      expect(names(await repo.findAll())).toEqual([
        'Mesa 100% roble',
        'Mesa 1000 pino',
        'Silla_azul',
        'Sillas azul',
        'Caja !oferta',
      ]);
    });

    it('busca sin distinguir mayusculas', async () => {
      expect(names(await repo.findAll({ name: 'MESA' }))).toEqual([
        'Mesa 100% roble',
        'Mesa 1000 pino',
      ]);
    });

    it('% se busca literal, no como comodin', async () => {
      expect(names(await repo.findAll({ name: '100%' }))).toEqual([
        'Mesa 100% roble',
      ]);
    });

    it('_ se busca literal, no como comodin', async () => {
      expect(names(await repo.findAll({ name: 'a_a' }))).toEqual(['Silla_azul']);
    });

    it('el caracter de escape ! tambien se busca literal', async () => {
      expect(names(await repo.findAll({ name: '!o' }))).toEqual(['Caja !oferta']);
    });

    it('pagina con offset y limit, y total cuenta todas las filas', async () => {
      const page = await repo.findAll({}, { offset: 2, limit: 2 });

      expect(names(page)).toEqual(['Silla_azul', 'Sillas azul']);
      expect(page.total).toBe(5);
    });

    it('el total respeta el filtro, no solo la pagina', async () => {
      const page = await repo.findAll({ name: 'mesa' }, { offset: 0, limit: 1 });

      expect(names(page)).toEqual(['Mesa 100% roble']);
      expect(page.total).toBe(2);
    });

    it('una pagina fuera de rango devuelve items vacio y el total real', async () => {
      const page = await repo.findAll({}, { offset: 100, limit: 5 });

      expect(page).toEqual({ items: [], total: 5 });
    });
  });

  describe('update y delete', () => {
    it('update de un id inexistente devuelve null', async () => {
      await expect(repo.update(999, { price: 1 })).resolves.toBeNull();
    });

    it('update con los mismos valores devuelve el producto (no lo confunde con inexistente)', async () => {
      const mesa = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      // MySQL puede informar 0 filas cambiadas si los valores no cambian
      const updated = await repo.update(mesa.id, { name: 'Mesa', price: 10 });

      expect(updated).toMatchObject({ id: mesa.id, name: 'Mesa', price: 10 });
    });

    it('update sin campos devuelve el producto tal cual, o null si no existe', async () => {
      const mesa = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      await expect(repo.update(mesa.id, {})).resolves.toMatchObject({ id: mesa.id });
      await expect(repo.update(999, {})).resolves.toBeNull();
    });

    it('update no vuelve a crear un producto borrado por otra peticion', async () => {
      const mesa = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });
      const ormRepo = dataSource.getRepository(Product);
      const originalFindOneBy = ormRepo.findOneBy.bind(ormRepo);

      // Simula la carrera: otra conexion borra la fila justo despues de que el
      // repositorio la lee. Con la version anterior (findOneBy + save) save()
      // hacia upsert y la fila reaparecia
      const spy = jest
        .spyOn(ormRepo, 'findOneBy')
        .mockImplementationOnce(async (where) => {
          const found = await originalFindOneBy(where);
          await dataSource.query('DELETE FROM products WHERE id = ?', [mesa.id]);
          return found;
        });

      try {
        await repo.update(mesa.id, { price: 99 });
      } finally {
        spy.mockRestore();
      }

      await expect(repo.findById(mesa.id)).resolves.toBeNull();
      const [{ total }] = await dataSource.query<{ total: string }[]>(
        'SELECT COUNT(*) AS total FROM products',
      );
      expect(Number(total)).toBe(0);
    });

    it('delete devuelve true la primera vez y false si ya no existe', async () => {
      const { id } = await repo.create({ sku: 'SKU-1', name: 'Mesa', price: 10 });

      await expect(repo.delete(id)).resolves.toBe(true);
      await expect(repo.delete(id)).resolves.toBe(false);
      await expect(repo.findById(id)).resolves.toBeNull();
    });
  });
});
