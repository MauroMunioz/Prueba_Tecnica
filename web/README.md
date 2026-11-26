# web

Frontend de inventario con Next.js 16 (App Router), TypeScript y Tailwind CSS 4.

## Desarrollo

Requiere la API corriendo (por defecto en http://localhost:3000, por ejemplo con
`docker compose up -d` desde la raiz del repositorio).

```bash
npm install
npm run dev        # http://localhost:3001
```

Variables (opcionales, ver `.env.example`):

- `API_URL`: direccion de la API. Next reenvia `/api/*` a `${API_URL}/api/*`.

## Comandos

```bash
npm run lint
npm run typecheck
npm run build && npm start
```

## Estructura

```
app/
  layout.tsx           layout raiz (servidor)
  page.tsx             pagina de inventario (servidor)
  components/
    InventoryView.tsx  estado de la pagina y coordinacion (cliente)
    ProductTable.tsx   tabla/tarjetas con estados de carga, vacio y error
    ProductForm.tsx    formulario de crear/editar con validacion (cliente)
    SearchBar.tsx      busqueda con debounce de 300 ms (cliente)
    ConfirmDialog.tsx  dialogo de confirmacion (cliente)
    ui/                Button, Modal, Notice
lib/
  api.ts               funciones tipadas para /api/products
  api-error.ts         ApiError (status + message de Nest)
  types.ts             tipos del contrato con la API
  validation.ts        reglas de validacion, iguales a las de la API
  form-errors.ts       errores de la API -> errores por campo
  format.ts            formato de precio y fecha
  hooks/use-products.ts  carga de la lista con cancelacion
```
