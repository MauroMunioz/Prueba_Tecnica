import { ConflictException, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { DuplicateSkuError } from './errors/duplicate-sku.error';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';

// Repositorio falso: cada metodo es un jest.fn() que cada test programa
function createRepositoryMock(): jest.Mocked<ProductsRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySku: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function buildProduct(overrides: Partial<Product> = {}): Product {
  return Object.assign(new Product(), {
    id: 1,
    sku: 'SKU-1',
    name: 'Mesa',
    price: 100,
    stock: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  });
}

describe('ProductsService', () => {
  let repo: jest.Mocked<ProductsRepository>;
  let service: ProductsService;

  beforeEach(() => {
    repo = createRepositoryMock();
    service = new ProductsService(repo);
  });

  describe('findAll', () => {
    it('pasa el texto de busqueda al repositorio como filtro por nombre', async () => {
      repo.findAll.mockResolvedValue([buildProduct()]);

      await expect(service.findAll('mesa')).resolves.toHaveLength(1);
      expect(repo.findAll).toHaveBeenCalledWith({ name: 'mesa' });
    });

    it('no filtra cuando q viene vacio', async () => {
      repo.findAll.mockResolvedValue([]);

      await service.findAll('');
      expect(repo.findAll).toHaveBeenCalledWith({ name: undefined });
    });
  });

  describe('findOne', () => {
    it('devuelve el producto si existe', async () => {
      const product = buildProduct();
      repo.findById.mockResolvedValue(product);

      await expect(service.findOne(1)).resolves.toBe(product);
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = { sku: 'SKU-1', name: 'Mesa', price: 100 };

    it('devuelve el producto creado', async () => {
      const product = buildProduct();
      repo.create.mockResolvedValue(product);

      await expect(service.create(dto)).resolves.toBe(product);
      expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('traduce DuplicateSkuError a ConflictException', async () => {
      repo.create.mockRejectedValue(new DuplicateSkuError('SKU-1'));

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('deja pasar otros errores sin transformarlos', async () => {
      const dbDown = new Error('conexion perdida');
      repo.create.mockRejectedValue(dbDown);

      await expect(service.create(dto)).rejects.toBe(dbDown);
    });
  });

  describe('update', () => {
    it('devuelve el producto actualizado', async () => {
      const updated = buildProduct({ price: 80 });
      repo.update.mockResolvedValue(updated);

      await expect(service.update(1, { price: 80 })).resolves.toBe(updated);
      expect(repo.update).toHaveBeenCalledWith(1, { price: 80 });
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      repo.update.mockResolvedValue(null);

      await expect(service.update(99, { price: 80 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('traduce DuplicateSkuError a ConflictException', async () => {
      repo.update.mockRejectedValue(new DuplicateSkuError('SKU-2'));

      await expect(service.update(1, { sku: 'SKU-2' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('termina sin error si el repositorio borro el producto', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('lanza NotFoundException si no habia nada que borrar', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
