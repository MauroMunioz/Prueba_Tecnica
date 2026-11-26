-- Esquema de la base de datos.
-- Se ejecuta automaticamente en el primer arranque del contenedor MySQL,
-- sobre la base indicada en DB_DATABASE.
-- Para volver a ejecutarlo: npm run db:reset

SET NAMES utf8mb4;

-- Las tablas se agregan aqui a medida que se crean los modulos.

CREATE TABLE IF NOT EXISTS products (
  id         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  sku        VARCHAR(64)    NOT NULL,
  name       VARCHAR(255)   NOT NULL,
  -- DECIMAL para no perder precision en importes; mysql2 lo devuelve como string
  price      DECIMAL(10, 2) NOT NULL,
  stock      INT UNSIGNED   NOT NULL DEFAULT 0,
  created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
