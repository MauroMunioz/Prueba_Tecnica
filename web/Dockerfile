# Etapa deps: solo dependencias, en su propia capa para reutilizarla mientras no cambie el lockfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etapa build: compila la app en modo standalone
FROM node:22-alpine AS build
WORKDIR /app

# Los rewrites de next.config se resuelven en el build: la direccion de la API
# tiene que existir aqui, no solo al ejecutar el contenedor
ARG API_URL=http://api:3000
ENV API_URL=${API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public puede no existir en un clone (git no guarda carpetas vacias) y el runner la copia
RUN mkdir -p public && npm run build

# Etapa runner: solo el servidor standalone y los archivos estaticos
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
# Sin esto el servidor escucha solo en localhost del contenedor y no es accesible desde afuera
ENV HOSTNAME=0.0.0.0

# server.js y las dependencias minimas; node es dueno para que Next pueda escribir su cache
COPY --from=build --chown=node:node /app/.next/standalone ./
# El standalone no incluye los estaticos: se copian donde server.js los sirve
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node

EXPOSE 3001
CMD ["node", "server.js"]
