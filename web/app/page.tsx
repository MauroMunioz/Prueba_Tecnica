import type { Metadata } from 'next';
import { InventoryView } from './components/InventoryView';

export const metadata: Metadata = {
  title: 'Inventario',
};

// Componente de servidor: el encabezado es estatico y se envia como HTML sin JS.
// Solo InventoryView (busqueda, tabla, formularios) se hidrata en el navegador.
export default function InventoryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Inventario
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulta, crea, edita y elimina los productos del catalogo.
        </p>
      </header>
      <InventoryView />
    </main>
  );
}
