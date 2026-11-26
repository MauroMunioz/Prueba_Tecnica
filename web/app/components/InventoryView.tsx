'use client';

import { PackagePlus, Pencil, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ApiError, deleteProduct } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-error';
import { formatNumber } from '@/lib/format';
import { useProducts } from '@/lib/hooks/use-products';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import type { Product } from '@/lib/types';
import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';
import { ProductForm } from './ProductForm';
import { ProductTable } from './ProductTable';
import { SearchBar } from './SearchBar';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Notice, type NoticeTone } from './ui/Notice';

type NoticeState = { id: number; tone: NoticeTone; text: string } | null;

const NOT_FOUND_TEXT =
  'El producto ya no existe: es posible que se haya eliminado en otra sesión. La lista se actualizó.';

// Debe coincidir con la duracion de row-out en globals.css
const ROW_EXIT_MS = 320;
const HIGHLIGHT_MS = 1600;

/**
 * Coordina la pagina de inventario: busqueda, lista, paginacion, formulario y borrado.
 * Los componentes hijos solo muestran datos y avisan con callbacks.
 */
export function InventoryView() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const { products, total, totalPages, error, isLoading, isInitialLoading, reload } =
    useProducts({ q: query, page, limit });

  // Abierto/cerrado va separado de los datos: al cerrar, los modales siguen
  // mostrando su contenido mientras corre la animacion de salida
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  // Cambia en cada apertura para que el formulario arranque de cero
  const [formSession, setFormSession] = useState(0);
  const [formBusy, setFormBusy] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<number | null>(null);
  // Fila que ya termino de salir: se oculta sin esperar la recarga, para que no quede un hueco
  const [removedId, setRemovedId] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  // Si la pagina actual quedo fuera de rango (por ejemplo, se borro el unico
  // producto de la ultima pagina) se pasa a la ultima que existe. Se ajusta
  // durante el render, como recomienda React, y no en un efecto
  if (!isLoading && !error && totalPages > 0 && page > totalPages) {
    setPage(totalPages);
  }

  // El resaltado de la fila guardada se apaga solo
  useEffect(() => {
    if (highlightId === null) return;
    const timer = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const showNotice = useCallback((tone: NoticeTone, text: string) => {
    setNotice({ id: Date.now(), tone, text });
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  // Una busqueda o un tamano nuevo cambian las paginas: se vuelve a la primera
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setPage(1);
  }, []);

  function handleLimitChange(size: number) {
    setLimit(size);
    setPage(1);
  }

  function openForm(product: Product | null) {
    setEditing(product);
    setFormSession((n) => n + 1);
    setFormOpen(true);
  }

  function handleSaved(product: Product) {
    const verb = editing ? 'actualizado' : 'creado';
    setFormOpen(false);
    setHighlightId(product.id);
    showNotice('success', `Producto "${product.name}" ${verb}.`);
    reload();
  }

  function handleNotFound() {
    setFormOpen(false);
    setDeleteOpen(false);
    showNotice('warning', NOT_FOUND_TEXT);
    reload();
  }

  function requestDelete(product: Product) {
    setDeleteError(null);
    setToDelete(product);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(toDelete.id);
      setDeleteOpen(false);
      showNotice('success', `Producto "${toDelete.name}" eliminado.`);
      // La fila sale con animacion y despues se recarga la pagina
      const removed = toDelete.id;
      setRemovingId(removed);
      setTimeout(() => {
        setRemovedId(removed);
        reload();
      }, ROW_EXIT_MS);
    } catch (err) {
      if (err instanceof ApiError && err.isNotFound) handleNotFound();
      else setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const visibleProducts =
    removedId === null ? products : products.filter((product) => product.id !== removedId);

  const showCount = !isInitialLoading && !error && total > 0;
  // Con 5 o menos productos todo cabe en una pagina del tamano mas chico
  const showPagination = showCount && total > PAGE_SIZE_OPTIONS[0];

  return (
    <>
      {notice && (
        <Notice
          key={notice.id}
          tone={notice.tone}
          onDismiss={dismissNotice}
          // Los avisos de exito se van solos; el de "ya no existe" queda hasta cerrarlo
          autoHideMs={notice.tone === 'success' ? 4000 : undefined}
        >
          {notice.text}
        </Notice>
      )}

      <section
        aria-label="Inventario"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <SearchBar onSearch={handleSearch} />
            <p className="text-sm text-slate-500" aria-live="polite">
              {isLoading && !isInitialLoading ? (
                'Actualizando...'
              ) : showCount ? (
                <>
                  <span className="font-semibold text-slate-900">{formatNumber(total)}</span>{' '}
                  {total === 1 ? 'producto' : 'productos'}
                  {query && <> para &ldquo;{query}&rdquo;</>}
                </>
              ) : null}
            </p>
          </div>
          <Button onClick={() => openForm(null)}>
            <Plus />
            Nuevo producto
          </Button>
        </div>

        <ProductTable
          products={visibleProducts}
          query={query}
          isInitialLoading={isInitialLoading}
          isRefreshing={isLoading && !isInitialLoading}
          error={error}
          removingId={removingId}
          highlightId={highlightId}
          onRetry={reload}
          onCreate={() => openForm(null)}
          onEdit={(product) => openForm(product)}
          onDelete={requestDelete}
        />

        {showPagination && (
          <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              disabled={isLoading}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}
      </section>

      <Modal
        open={formOpen}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        description={
          editing
            ? 'Modifica los datos y guarda los cambios.'
            : 'Completa los datos para registrar el producto en el inventario.'
        }
        icon={editing ? <Pencil /> : <PackagePlus />}
        onClose={() => setFormOpen(false)}
        preventClose={formBusy}
      >
        <ProductForm
          key={formSession}
          product={editing ?? undefined}
          onSaved={handleSaved}
          onNotFound={handleNotFound}
          onCancel={() => setFormOpen(false)}
          onBusyChange={setFormBusy}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar producto"
        description={
          toDelete && (
            <>
              Se eliminará <strong className="text-slate-900">{toDelete.name}</strong> (
              <span className="font-mono">{toDelete.sku}</span>). Esta acción no se puede deshacer.
            </>
          )
        }
        confirmLabel="Eliminar"
        busyLabel="Eliminando..."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
