import type { NextConfig } from "next";

// Direccion de la API Nest. En local http://localhost:3000; en Docker, http://api:3000.
// Se lee en next build y queda fija en el resultado: cambiarla exige recompilar.
// Se quita la barra final para no generar "//api" en el destino.
const API_URL = (process.env.API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Genera .next/standalone con server.js y solo las dependencias necesarias (imagen Docker chica)
  output: "standalone",
  // next dev no genera AGENTS.md en la raiz del proyecto
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Raiz explicita: sin esto Next busca lockfiles en carpetas superiores
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // El navegador llama a /api/* en el mismo origen y Next lo reenvia a la API:
  // no hace falta CORS y la direccion real de la API no se expone al cliente.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
