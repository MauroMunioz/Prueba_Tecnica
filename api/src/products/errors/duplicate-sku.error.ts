// Error de dominio: no depende de MySQL ni de TypeORM
export class DuplicateSkuError extends Error {
  constructor(public readonly sku: string) {
    super(`Ya existe un producto con el SKU "${sku}"`);
    this.name = 'DuplicateSkuError';
  }
}
