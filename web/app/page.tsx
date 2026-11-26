import { ChevronRight } from 'lucide-react';
import { InventoryView } from './components/InventoryView';

// Componente de servidor: el encabezado es estatico y se envia como HTML sin JS.
// Solo InventoryView (busqueda, tabla, formularios) se hidrata en el navegador.
export default function InventoryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6">
        <nav aria-label="Ruta" className="mb-3 flex items-center gap-1 text-xs font-medium text-slate-500">
          <span>Inicio</span>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="text-brand-700" aria-current="page">
            Inventario
          </span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
          Inventario de productos
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
          Administra el catálogo: registra productos, actualiza precios y controla el stock
          disponible.
        </p>
      </header>
      <InventoryView />
    </main>
  );
}
