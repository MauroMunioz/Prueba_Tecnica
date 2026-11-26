import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from '../../../src/config/database.config';
import { Product } from '../../../src/products/entities/product.entity';

/**
 * DataSource con las mismas opciones que la app (incluido timezone), para que
 * los tests detecten si alguna de ellas se rompe. autoLoadEntities es propio
 * de Nest, por eso aqui las entidades se listan a mano.
 */
export function createTestDataSource(): DataSource {
  const { autoLoadEntities: _ignored, ...options } =
    databaseConfig() as TypeOrmModuleOptions & { autoLoadEntities?: boolean };

  return new DataSource({
    ...(options as DataSourceOptions),
    entities: [Product],
  });
}
