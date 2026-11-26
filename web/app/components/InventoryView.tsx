'use client';

import { useCallback, useState } from 'react';
import { ApiError, deleteProduct } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-error';
import { useProducts } from '@/lib/hooks/use-products';
import type { Product } from '@/lib/types';
import { ConfirmDialog } from './ConfirmDialog';
import { ProductForm } from './ProductForm';
import { ProductTable } from './ProductTable';
import { SearchBar } from './SearchBar';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Notice, type NoticeTone } from './ui/Notice';

type FormState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;
type NoticeState = { id: number; tone: NoticeTone; text: string } | null;

const NOT_FOUND_TEXT =
  'El producto ya no existe: es posible que se haya eliminado en otra sesion. La lista se actualizo.';

/**
 * Coordina la pagina de inventario: busqueda, lista, formulario y borrado.
 * Los componentes hijos solo muestran datos y avisan con callbacks.
 */
export function InventoryView() {
  const [query, setQuery] = useState('');
  const { products, error, isLoading, isInitialLoading, reload } = useProducts(query);

  const [form, setForm] = useState<FormState>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  const showNotice = useCallback((tone: NoticeTone, text: string) => {
    setNotice({ id: Date.now(), tone, text });
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  function handleSaved(product: Product) {
    const verb = form?.mode === 'edit' ? 'actualizado' : 'creado';
    setForm(null);
    showNotice('success', `Producto "${product.name}" ${verb}.`);
    reload();
  }

  function handleNotFound() {
    setForm(null);
    setToDelete(null);
    showNotice('warning', NOT_FOUND_TEXT);
    reload();
  }

  function requestDelete(product: Product) {
    setDeleteError(null);
    setToDelete(product);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(toDelete.id);
      setToDelete(null);
      showNotice('success', `Producto "${toDelete.name}" eliminado.`);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.isNotFound) handleNotFound();
      else setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const editing = form?.mode === 'edit' ? form.product : undefined;
  const showCount = !isInitialLoading && !error && products.length > 0;

  return (
    <section aria-label="Inventario" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar onSearch={setQuery} />
        <Button onClick={() => setForm({ mode: 'create' })}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Nuevo producto
        </Button>
      </div>

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

      <p className="h-5 text-sm text-slate-500" aria-live="polite">
        {isLoading && !isInitialLoading
          ? 'Actualizando...'
          : showCount
            ? `${products.length} ${products.length === 1 ? 'producto' : 'productos'}${query ? ` para "${query}"` : ''}`
            : null}
      </p>

      <ProductTable
        products={products}
        query={query}
        isInitialLoading={isInitialLoading}
        isRefreshing={isLoading && !isInitialLoading}
        error={error}
        onRetry={reload}
        onCreate={() => setForm({ mode: 'create' })}
        onEdit={(product) => setForm({ mode: 'edit', product })}
        onDelete={requestDelete}
      />

      <Modal
        open={form !== null}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        onClose={() => setForm(null)}
        preventClose={formBusy}
      >
        {/* key: al pasar de un producto a otro, el formulario arranca de cero */}
        <ProductForm
          key={editing?.id ?? 'new'}
          product={editing}
          onSaved={handleSaved}
          onNotFound={handleNotFound}
          onCancel={() => setForm(null)}
          onBusyChange={setFormBusy}
        />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar producto"
        description={
          toDelete && (
            <>
              Se eliminara <strong className="text-slate-900">{toDelete.name}</strong>{' '}
              (<span className="font-mono">{toDelete.sku}</span>). Esta accion no se puede deshacer.
            </>
          )
        }
        confirmLabel="Eliminar"
        busyLabel="Eliminando..."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
