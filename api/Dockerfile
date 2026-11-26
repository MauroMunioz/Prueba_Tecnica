# Etapa build: dependencias completas (incluye @nestjs/cli y typescript) para compilar
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo los manifiestos: si no cambian, Docker reutiliza la capa de npm ci
COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# Etapa runtime: solo dependencias de produccion y el codigo compilado
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# La imagen oficial trae el usuario node; la app no necesita root
USER node

EXPOSE 3000
CMD ["node", "dist/main"]
