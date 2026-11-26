# pretrabajo

API REST de inventario de productos hecha con NestJS y MySQL, con un frontend en Next.js para consultar, crear, editar y eliminar productos. Todo se levanta con Docker Compose.

## Stack

| Capa | Tecnología |
|---|---|
| API | NestJS 11.2, TypeScript 5.9, TypeORM 0.3.31, mysql2 3.24 |
| Validación y documentación | class-validator 0.14, class-transformer 0.5, @nestjs/swagger 11.4 |
| Configuración | @nestjs/config 4.0 (variables de entorno y `.env`) |
| Base de datos | MySQL 8.4 |
| Frontend | Next.js 16.4 (App Router), React 19.3, Tailwind CSS 4.3, TypeScript 5.9, ESLint 9 |
| Pruebas | Jest 29.7, ts-jest 29.4, supertest 7.3 |
| Contenedores | Docker Compose, imágenes `node:22-alpine` y `mysql:8.4` |

Las versiones mayores están fijadas en cada `package.json`.

## Requisitos previos

- **Con Docker:** Docker con Docker Compose v2. No hace falta nada más.
- **Sin Docker:** Node.js 22 o superior con npm, y un servidor MySQL 8.4.

## Inicio rápido con Docker

```bash
cp .env.example .env
docker compose up --build
```

El `.env` es opcional: todas las variables tienen un valor por defecto en `docker-compose.yml`.

Compose levanta MySQL y aplica `database/schema.sql`. Espera a que la base pase el healthcheck, arranca la API y después el frontend. La primera vez tarda unos minutos en construir las imágenes.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

La especificación OpenAPI en JSON está en http://localhost:3000/api/docs-json.

El navegador llama a `/api/*` en el mismo origen del frontend, y el servidor de Next reenvía esas peticiones a la API por la red interna de Docker (`http://api:3000`). Por eso no hace falta configurar CORS.

Comandos útiles:

```bash
docker compose ps                # estado de los servicios
docker compose logs -f api       # logs de un servicio (api, web o mysql)
docker compose down              # detener y conservar los datos
docker compose down -v           # detener y borrar los datos
```

## Ejecución local sin Docker

### 1. Base de datos

Con un servidor MySQL 8.4 propio, se crea la base y el usuario con los valores de `.env.example` y se aplica el esquema:

```bash
mysql -u root -p -e "
  CREATE DATABASE pretrabajo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'app'@'%' IDENTIFIED BY 'app_password';
  GRANT ALL PRIVILEGES ON pretrabajo.* TO 'app'@'%';"

mysql -u app -p pretrabajo < database/schema.sql
```

La API lee las fechas suponiendo que MySQL trabaja en UTC (`timezone: 'Z'` en `api/src/config/database.config.ts`), igual que el contenedor. Con un servidor en otra zona horaria, `createdAt` se mostraría desplazado; conviene configurarlo con `default-time-zone='+00:00'`.

Si se tiene Docker, también se puede levantar solo la base con `docker compose up -d mysql` y seguir con el paso 2.

### 2. API

```bash
cp .env.example .env       # en la raíz; la API lo lee desde api/ con DB_HOST=localhost
cd api
npm install
npm run start:dev          # http://localhost:3000/api y Swagger en /api/docs
```

La API busca primero `api/.env` y, si no existe, el `.env` de la raíz. Las variables de entorno ya definidas tienen prioridad sobre ambos.

### 3. Frontend

En otra terminal:

```bash
cd web
npm install
npm run dev                # http://localhost:3001
```

Por defecto reenvía `/api/*` a `http://localhost:3000`. Para cambiarlo, crear `web/.env.local` a partir de `web/.env.example`.

Otros comandos del frontend: `npm run lint`, `npm run typecheck`, y `npm run build && npm start` para modo producción.

## Configuración

### `.env` de la raíz (`.env.example`)

Lo leen Docker Compose y la API cuando corre fuera de Docker.

| Variable | Valor por defecto | Uso |
|---|---|---|
| `DB_DATABASE` | `pretrabajo` | Nombre de la base. MySQL la crea en el primer arranque y la API se conecta a ella. |
| `DB_USERNAME` | `app` | Usuario de la API. MySQL lo crea en el primer arranque. |
| `DB_PASSWORD` | `app_password` | Contraseña de ese usuario. |
| `DB_ROOT_PASSWORD` | `root_password` | Contraseña de root de MySQL. También la usan los tests de integración para crear su base. |
| `WEB_PORT` | `3001` | Puerto del frontend publicado en el host. |
| `API_PORT` | `3000` | Puerto de la API publicado en el host. |
| `DB_PORT` | `3306` | Puerto de MySQL publicado en el host. Dentro de Docker la API siempre usa 3306. |
| `NEXT_PUBLIC_CURRENCY` | `COP` | Moneda de los precios en el frontend (`COP` o `USD`). Solo cambia el formato, no convierte valores. Se aplica al construir la imagen `web`. |
| `DB_HOST` | `localhost` | Host de MySQL para la API fuera de Docker. En Docker, compose fija `mysql`. |
| `PORT` | `3000` | Puerto de la API fuera de Docker. En Docker, compose fija `3000`. |
| `DB_TEST_DATABASE` | `pretrabajo_test` | Base para `npm run test:int`. Se borra y recrea en cada ejecución, y debe terminar en `_test`. |

### `web/.env.example`

Solo para el frontend fuera de Docker; se copia a `web/.env.local`.

| Variable | Valor por defecto | Uso |
|---|---|---|
| `API_URL` | `http://localhost:3000` | Dirección a la que Next reenvía `/api/*`. En Docker, compose la fija en `http://api:3000`. |
| `NEXT_PUBLIC_CURRENCY` | `COP` | Igual que en la raíz. |

`API_URL` y `NEXT_PUBLIC_CURRENCY` se fijan al compilar el frontend. En Docker, cambiarlas exige reconstruir la imagen con `docker compose up -d --build web`.

## Base de datos

El esquema está en `database/schema.sql`, que define la tabla `products`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `INT UNSIGNED AUTO_INCREMENT` | Clave primaria |
| `sku` | `VARCHAR(64)` | Único (`uq_products_sku`) |
| `name` | `VARCHAR(255)` | |
| `price` | `DECIMAL(10, 2)` | |
| `stock` | `INT UNSIGNED` | Por defecto `0` |
| `created_at` | `TIMESTAMP` | Por defecto `CURRENT_TIMESTAMP` |

La tabla usa `utf8mb4_unicode_ci`, así que la unicidad del SKU y las búsquedas no distinguen mayúsculas.

**Cómo se aplica:** `docker-compose.yml` monta el archivo en `/docker-entrypoint-initdb.d/` del contenedor MySQL. La imagen oficial ejecuta ese directorio **solo cuando el volumen de datos está vacío**, es decir, en el primer arranque.

Para aplicar un cambio del esquema hay que borrar el volumen:

```bash
docker compose down -v
docker compose up --build
```

Desde `api/` también se puede usar `npm run db:reset`, que hace lo mismo pero levanta solo MySQL.

La API no modifica el esquema: TypeORM tiene `synchronize: false` y la entidad `Product` solo mapea la tabla existente.

## Endpoints

Todas las rutas están bajo el prefijo `/api`.

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/products` | Lista los productos ordenados por id. Con `?q=texto` filtra por nombre. | 200, 400 |
| GET | `/api/products/:id` | Obtiene un producto. | 200, 400, 404 |
| POST | `/api/products` | Crea un producto. | 201, 400, 409 |
| PATCH | `/api/products/:id` | Actualiza solo los campos enviados. | 200, 400, 404, 409 |
| DELETE | `/api/products/:id` | Elimina un producto. | 204, 400, 404 |

**Qué significa cada código de error:**

- **400:** datos inválidos, un parámetro de consulta no permitido o un id que no es un entero positivo.
- **404:** el producto no existe.
- **409:** el SKU ya pertenece a otro producto. En `PATCH`, conservar el SKU propio no es conflicto.

**Reglas de validación:**

- `sku`: obligatorio, hasta 64 caracteres. Se recortan los espacios de los extremos.
- `name`: obligatorio, hasta 255 caracteres. Se recortan los espacios de los extremos.
- `price`: número mayor que 0, con máximo 2 decimales, hasta 99999999.99.
- `stock`: entero mayor o igual a 0. Es opcional: si no se envía, vale 0.
- No se aceptan propiedades que no estén en esta lista.

**Búsqueda (`q`):** busca el texto dentro del nombre sin distinguir mayúsculas. Los caracteres `%` y `_` se buscan literalmente, no como comodines. Un `q` vacío o solo con espacios no filtra.

**Formato de los errores:** es el de Nest. `message` es una lista en los errores de validación (un mensaje por campo) y un texto en los demás casos:

```json
{ "message": ["El precio debe ser mayor que 0"], "error": "Bad Request", "statusCode": 400 }
```

### Ejemplos con curl

Los ejemplos usan sintaxis de bash (Linux, macOS, WSL o Git Bash).

```bash
# Crear (201)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"SKU-001","name":"Mesa de roble","price":199.99,"stock":3}'

# Listar todo (200)
curl http://localhost:3000/api/products

# Buscar por nombre (200); %25 es el caracter % codificado en la URL
curl "http://localhost:3000/api/products?q=mesa"
curl "http://localhost:3000/api/products?q=100%25"

# Obtener uno (200, o 404 si no existe)
curl http://localhost:3000/api/products/1

# Actualizar algunos campos (200)
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":150,"stock":10}'

# Eliminar (204, sin cuerpo)
curl -i -X DELETE http://localhost:3000/api/products/1
```

Respuestas de error:

```bash
# SKU repetido -> 409
# {"message":"Ya existe un producto con el SKU \"SKU-001\"","error":"Conflict","statusCode":409}

# Precio 0 -> 400
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"SKU-002","name":"Silla","price":0}'
# {"message":["El precio debe ser mayor que 0"],"error":"Bad Request","statusCode":400}

# Id invalido -> 400
curl http://localhost:3000/api/products/abc
# {"message":"El id debe ser un numero entero positivo","error":"Bad Request","statusCode":400}

# Id inexistente -> 404
curl http://localhost:3000/api/products/999
# {"message":"No existe un producto con id 999","error":"Not Found","statusCode":404}
```

## Pruebas

```bash
cd api
npm install
npm test
```

`npm test` corre las pruebas unitarias y las e2e (26 en total). También se pueden correr por separado con `npm run test:unit` y `npm run test:e2e`.

**Unitarias (`api/src/products/products.service.spec.ts`, 12 pruebas).** Prueban `ProductsService` con el repositorio reemplazado por mocks de Jest:

- El listado pasa la búsqueda al repositorio, y un `q` vacío no filtra.
- Si el producto no existe, `findOne`, `update` y `remove` lanzan 404.
- `DuplicateSkuError` se convierte en 409 al crear y al actualizar.
- Otros errores del repositorio se propagan sin transformarse.

**E2e (`api/test/products.e2e-spec.ts`, 14 pruebas).** Hacen peticiones HTTP reales con supertest contra la aplicación Nest: controller, service, `ValidationPipe` global y el prefijo `/api`. Cubren:

- crear un producto válido → 201, con el SKU recortado y la respuesta completa;
- `price` 0 → 400, y sin `name` → 400, con sus mensajes;
- SKU repetido → 409;
- id inexistente en `GET`, `PATCH` y `DELETE` → 404;
- actualizar y luego eliminar, comprobando que ambos cambios se reflejan en el listado;
- `null` en `sku`, `name`, `price` o `stock` → 400 (no 500), sin modificar el producto.

**Por qué corren sin MySQL:**

- Las unitarias usan mocks del repositorio.
- Las e2e montan la app con `createTestApp()` (`api/test/support/`), que usa `InMemoryProductsRepository` en lugar de la implementación TypeORM. Esto es posible porque el service depende de la clase abstracta `ProductsRepository`, no de TypeORM. Las e2e no importan `AppModule` ni `ProductsModule`, que abrirían la conexión a MySQL.
- La app de prueba usa la misma `configureApp()` que `main.ts`, así que la validación y el prefijo son los mismos que en producción.

**Integración (`npm run test:int`, 19 pruebas).** Estas sí necesitan MySQL, por ejemplo con `docker compose up -d mysql`. Usan la base `DB_TEST_DATABASE`, que se borra y se recrea desde `schema.sql` en cada ejecución. Cubren lo que las e2e no pueden:

- la conversión de `ER_DUP_ENTRY` a `DuplicateSkuError`;
- el escape de `%` y `_` en la búsqueda;
- que `price` llegue como número y `createdAt` sin desfase horario;
- que un `PATCH` no vuelva a crear un producto borrado por otra petición a la vez;
- la aplicación completa con `AppModule` y MySQL.

El frontend no tiene pruebas automatizadas. Se verifica con `npm run lint`, `npm run typecheck` y `npm run build`.

## Estructura del proyecto

```
.
├── docker-compose.yml          mysql + api + web
├── .env.example                variables de configuración
├── database/
│   └── schema.sql              esquema de la base (fuente de verdad)
├── api/                        API NestJS
│   ├── Dockerfile              multi-stage, runtime sin dependencias de desarrollo
│   ├── src/
│   │   ├── main.ts             arranque: configureApp() + Swagger
│   │   ├── app.setup.ts        prefijo /api y ValidationPipe global
│   │   ├── app.module.ts       ConfigModule + TypeORM
│   │   ├── swagger.ts          documentación en /api/docs
│   │   ├── config/             configuración de la app y de la base
│   │   ├── common/             pipe de ids, transformers, DTO de error
│   │   └── products/
│   │       ├── products.controller.ts
│   │       ├── products.service.ts
│   │       ├── dto/            validaciones de entrada
│   │       ├── entities/       entidad Product
│   │       ├── errors/         DuplicateSkuError
│   │       └── repositories/   ProductsRepository (abstracta) y su implementación TypeORM
│   └── test/
│       ├── products.e2e-spec.ts
│       ├── support/            app de prueba y repositorio en memoria
│       └── integration/        pruebas contra MySQL
└── web/                        frontend Next.js
    ├── Dockerfile              multi-stage, salida standalone
    ├── next.config.ts          proxy /api/* hacia la API
    ├── app/
    │   ├── layout.tsx, page.tsx            componentes de servidor
    │   └── components/
    │       ├── InventoryView.tsx           estado de la página
    │       ├── ProductTable.tsx            tabla con estados de carga, vacío y error
    │       ├── ProductForm.tsx             formulario de crear y editar
    │       ├── SearchBar.tsx               búsqueda con debounce
    │       ├── ConfirmDialog.tsx           confirmación de borrado
    │       └── ui/                         Button, Modal, Notice
    └── lib/
        ├── api.ts, api-error.ts            cliente HTTP tipado y ApiError
        ├── types.ts                        tipos del contrato con la API
        ├── validation.ts                   reglas de validación del formulario
        ├── form-errors.ts                  errores de la API por campo
        ├── format.ts                       formato de precio y fecha
        └── hooks/use-products.ts           carga de la lista
```

## Decisiones técnicas

> Borrador para reescribir.

- **El esquema manda.** La base se define en `database/schema.sql` y TypeORM tiene `synchronize: false`; la entidad solo mapea la tabla. Así el esquema queda versionado como SQL legible y la aplicación nunca altera la base al arrancar.
- **Repositorio abstracto.** `ProductsService` depende de la clase abstracta `ProductsRepository`. En producción se inyecta `TypeOrmProductsRepository`; en las e2e, `InMemoryProductsRepository`. Gracias a eso, las e2e corren sin base de datos.
- **Errores de dominio.** El repositorio convierte el `ER_DUP_ENTRY` de MySQL en `DuplicateSkuError`, y el service lo traduce a 409. Así la capa HTTP no depende de los códigos de MySQL.
- **Precios en `DECIMAL(10,2)`.** Evita errores de redondeo al guardar. mysql2 devuelve `DECIMAL` como texto, y un transformer de la entidad lo convierte a número.
- **Fechas en UTC.** MySQL corre en UTC y la conexión usa `timezone: 'Z'`. El frontend convierte a la zona horaria del navegador.
- **Búsqueda literal.** `?q=` escapa `%`, `_` y el carácter de escape `!` antes del `LIKE`, con `ESCAPE '!'` explícito.
- **Validación estricta.** `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `stopAtFirstError`: rechaza propiedades desconocidas y devuelve un mensaje por campo, en español. Los ids de ruta usan un pipe propio (`ParseIdPipe`), porque `ParseIntPipe` acepta negativos.
- **Una sola configuración para app y pruebas.** `configureApp()` aplica el prefijo `/api` y el `ValidationPipe`, y se usa en `main.ts` y en las pruebas.
- **Proxy en lugar de CORS.** El frontend llama a `/api` en su propio origen y Next lo reenvía a la API con `rewrites`. `API_URL` se fija al compilar, porque los rewrites se resuelven en el build.
- **Componentes de cliente solo donde hay interactividad.** `page.tsx` y `layout.tsx` son de servidor. La lista se carga en el cliente porque depende de la búsqueda y se recarga después de cada operación.
- **Validación en el cliente con las mismas reglas y mensajes que la API.** Los 400 de la API se asocian a cada campo según el inicio del mensaje (por ejemplo, "El precio..."); lo que no se reconoce se muestra arriba del formulario.
- **Diálogos con `<dialog>` nativo.** El navegador resuelve el foco, la tecla Escape y el fondo inerte, sin librerías.
- **Docker.** Imágenes multi-stage con `node:22-alpine` y usuario no root: la API instala solo dependencias de producción y el frontend usa la salida `standalone`. El healthcheck de MySQL usa `-h 127.0.0.1` para no dar la base por lista mientras todavía se aplica `schema.sql`.

## Uso de IA

Se usó un asistente de IA como apoyo para escribir código y documentación. Todo lo generado se revisó y se validó con las pruebas automatizadas y probando la aplicación.
