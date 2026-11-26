import {
  CircleCheck,
  CircleX,
  CloudOff,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  RotateCw,
  SearchX,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CURRENCY, formatDate, formatNumber, formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

// Sin 'use client': no tiene estado propio. Recibe callbacks, asi que en la
// practica se renderiza dentro de InventoryView, que si es de cliente.

/** Desde este numero de unidades hacia abajo el stock se marca como bajo */
const LOW_STOCK = 5;

interface ProductTableProps {
  products: Product[];
  /** Busqueda activa, para adaptar el mensaje de lista vacia */
  query: string;
  isInitialLoading: boolean;
  /** Recargando con datos previos en pantalla */
  isRefreshing: boolean;
  error: string | null;
  /** Producto recien eliminado: su fila sale con animacion */
  removingId?: number | null;
  /** Producto recien creado o editado: su fila se resalta */
  highlightId?: number | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable(props: ProductTableProps) {
  const { products, query, isInitialLoading, isRefreshing, error } = props;

  if (isInitialLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={props.onRetry} />;
  if (products.length === 0) {
    // Se borro la ultima fila visible y la pagina se esta recargando: no es una lista vacia
    if (isRefreshing) return <LoadingState />;
    return <EmptyState query={query} onCreate={props.onCreate} />;
  }

  const rowAnimation = (id: number) =>
    id === props.removingId ? 'animate-row-out' : id === props.highlightId ? 'animate-row-flash' : '';

  return (
    <div
      aria-busy={isRefreshing}
      className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}
    >
      {/* Escritorio y tablet: tabla */}
      {/* Con scroll horizontal si la pantalla es angosta; la barra se oculta (no-scrollbar) */}
      <div className="no-scrollbar hidden overflow-x-auto md:block">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <caption className="sr-only">Inventario de productos</caption>
          <thead className="border-y border-slate-200 bg-slate-50/80 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th scope="col" className="py-3 pr-4 pl-6">Producto</th>
              <th scope="col" className="px-4 py-3">SKU</th>
              <th scope="col" className="px-4 py-3 text-right">Precio ({CURRENCY})</th>
              <th scope="col" className="px-4 py-3">Stock</th>
              <th scope="col" className="px-4 py-3">Registrado</th>
              <th scope="col" className="py-3 pr-6 pl-4 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className={`transition-colors hover:bg-brand-50/40 ${rowAnimation(product.id)}`}
              >
                <td className="py-3 pr-4 pl-6">
                  <div className="flex items-center gap-3">
                    <ProductIcon />
                    <span className="max-w-xs truncate font-medium text-slate-900" title={product.name}>
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <SkuChip sku={product.sku} />
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular-nums">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3">
                  <StockBadge stock={product.stock} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  <time dateTime={product.createdAt}>{formatDate(product.createdAt)}</time>
                </td>
                <td className="py-3 pr-6 pl-4">
                  <RowActions product={product} onEdit={props.onEdit} onDelete={props.onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movil: tarjetas, una tabla de 6 columnas no cabe */}
      <ul className="divide-y divide-slate-100 border-t border-slate-200 md:hidden">
        {products.map((product) => (
          <li key={product.id} className={`px-4 py-4 ${rowAnimation(product.id)}`}>
            <div className="flex items-start gap-3">
              <ProductIcon />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-medium text-slate-900">{product.name}</p>
                  <p className="font-semibold text-slate-900 tabular-nums">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="mt-1">
                  <SkuChip sku={product.sku} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StockBadge stock={product.stock} />
                  <RowActions product={product} onEdit={props.onEdit} onDelete={props.onDelete} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductIcon() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
      <Package className="size-4" aria-hidden="true" />
    </span>
  );
}

function SkuChip({ sku }: { sku: string }) {
  return (
    <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600">
      {sku}
    </span>
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
      <Tooltip label="Editar producto" align="end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(product)}
          aria-label={`Editar ${product.name}`}
        >
          <Pencil />
        </Button>
      </Tooltip>
      <Tooltip label="Eliminar producto" align="end">
        <Button
          variant="ghost-danger"
          size="icon"
          onClick={() => onDelete(product)}
          aria-label={`Eliminar ${product.name}`}
        >
          <Trash2 />
        </Button>
      </Tooltip>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const units = `${formatNumber(stock)} ${stock === 1 ? 'unidad' : 'unidades'}`;

  if (stock === 0) {
    return (
      <Badge
        tone="bg-accent-50 text-accent-700 ring-accent-200"
        icon={<CircleX />}
        tooltip="Sin unidades disponibles"
      >
        Agotado
      </Badge>
    );
  }
  if (stock <= LOW_STOCK) {
    return (
      <Badge
        tone="bg-amber-50 text-amber-800 ring-amber-200"
        icon={<TriangleAlert />}
        tooltip={`Stock bajo: ${LOW_STOCK} unidades o menos`}
      >
        {units}
      </Badge>
    );
  }
  return (
    <Badge
      tone="bg-emerald-50 text-emerald-700 ring-emerald-200"
      icon={<CircleCheck />}
      tooltip="Stock disponible"
    >
      {units}
    </Badge>
  );
}

function Badge({
  tone,
  icon,
  tooltip,
  children,
}: {
  tone: string;
  icon: ReactNode;
  tooltip: string;
  children: string;
}) {
  return (
    <Tooltip label={tooltip}>
      <span
        // tabIndex para que el tooltip tambien se vea con teclado
        tabIndex={0}
        aria-label={`${children}. ${tooltip}`}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums ring-1 ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 [&_svg]:size-3.5 ${tone}`}
      >
        {icon}
        {children}
      </span>
    </Tooltip>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="border-t border-slate-200 px-6 py-4">
      <span className="sr-only">Cargando productos...</span>
      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4">
            <div className="size-9 rounded-lg bg-slate-200" />
            <div className="h-4 flex-1 rounded bg-slate-200" />
            <div className="hidden h-4 w-20 rounded bg-slate-200 sm:block" />
            <div className="hidden h-4 w-24 rounded bg-slate-200 sm:block" />
            <div className="hidden h-5 w-20 rounded-full bg-slate-200 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StateMessage({
  icon,
  tone,
  title,
  children,
}: {
  icon: ReactNode;
  tone: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center border-t border-slate-200 px-6 py-14 text-center">
      <span className={`grid size-12 place-items-center rounded-full ring-8 [&_svg]:size-6 ${tone}`}>
        {icon}
      </span>
      <p className="mt-5 font-semibold text-slate-900">{title}</p>
      {children}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert">
      <StateMessage
        icon={<CloudOff />}
        tone="bg-accent-50 text-accent-600 ring-accent-50/50"
        title="No se pudo cargar el inventario"
      >
        <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
        <Button variant="secondary" onClick={onRetry} className="mt-5">
          <RotateCw />
          Reintentar
        </Button>
      </StateMessage>
    </div>
  );
}

function EmptyState({ query, onCreate }: { query: string; onCreate: () => void }) {
  if (query) {
    return (
      <StateMessage
        icon={<SearchX />}
        tone="bg-slate-100 text-slate-500 ring-slate-50"
        title={`Sin resultados para "${query}"`}
      >
        <p className="mt-1 text-sm text-slate-500">Prueba con otra parte del nombre.</p>
      </StateMessage>
    );
  }
  return (
    <StateMessage
      icon={<PackageOpen />}
      tone="bg-brand-50 text-brand-700 ring-brand-50/50"
      title="Todavía no hay productos"
    >
      <p className="mt-1 text-sm text-slate-500">Registra el primero para empezar el inventario.</p>
      <Button onClick={onCreate} className="mt-5">
        <Plus />
        Nuevo producto
      </Button>
    </StateMessage>
  );
}
