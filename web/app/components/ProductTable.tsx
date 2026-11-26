import { CURRENCY, formatDate, formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Button } from './ui/Button';

// Sin 'use client': no tiene estado propio. Recibe callbacks, asi que en la
// practica se renderiza dentro de InventoryView, que si es de cliente.

interface ProductTableProps {
  products: Product[];
  /** Busqueda activa, para adaptar el mensaje de lista vacia */
  query: string;
  isInitialLoading: boolean;
  /** Recargando con datos previos en pantalla */
  isRefreshing: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable(props: ProductTableProps) {
  const { products, query, isInitialLoading, isRefreshing, error } = props;

  if (isInitialLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={props.onRetry} />;
  if (products.length === 0) return <EmptyState query={query} onCreate={props.onCreate} />;

  return (
    <div
      aria-busy={isRefreshing}
      className={`transition-opacity ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}
    >
      {/* Escritorio y tablet: tabla */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Inventario de productos</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">SKU</th>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3 text-right">Precio ({CURRENCY})</th>
              <th scope="col" className="px-4 py-3 text-right">Stock</th>
              <th scope="col" className="px-4 py-3">Creado</th>
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{product.sku}</td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900" title={product.name}>
                  {product.name}
                </td>
                <td className="px-4 py-3 text-right text-slate-900 tabular-nums">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <StockBadge stock={product.stock} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  <time dateTime={product.createdAt}>{formatDate(product.createdAt)}</time>
                </td>
                <td className="px-4 py-3">
                  <RowActions product={product} onEdit={props.onEdit} onDelete={props.onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movil: tarjetas, una tabla de 6 columnas no cabe */}
      <ul className="space-y-3 md:hidden">
        {products.map((product) => (
          <li key={product.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{product.name}</p>
                <p className="font-mono text-xs text-slate-500">{product.sku}</p>
              </div>
              <p className="font-medium text-slate-900 tabular-nums">{formatPrice(product.price)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                <StockBadge stock={product.stock} />
                <time dateTime={product.createdAt} className="text-xs">
                  {formatDate(product.createdAt)}
                </time>
              </div>
              <RowActions product={product} onEdit={props.onEdit} onDelete={props.onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RowActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}>
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(product)}
        aria-label={`Eliminar ${product.name}`}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Eliminar
      </Button>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Agotado
      </span>
    );
  }
  return (
    <span className="text-slate-700 tabular-nums">
      {stock.toLocaleString('es-CO')} <span className="text-slate-400 md:hidden">uds.</span>
    </span>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-4">
      <span className="sr-only">Cargando productos...</span>
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-4 flex-1 rounded bg-slate-200" />
            <div className="hidden h-4 w-24 rounded bg-slate-200 sm:block" />
            <div className="hidden h-4 w-12 rounded bg-slate-200 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="font-medium text-red-800">No se pudo cargar el inventario</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <Button variant="secondary" onClick={onRetry} className="mt-4">
        Reintentar
      </Button>
    </div>
  );
}

function EmptyState({ query, onCreate }: { query: string; onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {query ? (
        <>
          <p className="font-medium text-slate-900">Sin resultados para &ldquo;{query}&rdquo;</p>
          <p className="mt-1 text-sm text-slate-500">Prueba con otra parte del nombre.</p>
        </>
      ) : (
        <>
          <p className="font-medium text-slate-900">Todavia no hay productos</p>
          <p className="mt-1 text-sm text-slate-500">Crea el primero para empezar el inventario.</p>
          <Button onClick={onCreate} className="mt-4">
            Nuevo producto
          </Button>
        </>
      )}
    </div>
  );
}
