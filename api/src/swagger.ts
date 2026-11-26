import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs';

/**
 * Documentacion OpenAPI: interfaz en /api/docs y JSON en /api/docs-json
 * (bajo el mismo prefijo que el resto de la API, asi tambien pasa por el proxy del frontend).
 * Va aparte de configureApp() porque los tests no la necesitan.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('pretrabajo API')
    .setDescription('API REST de productos')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // useGlobalPrefix: aplica el prefijo /api de configureApp()
  SwaggerModule.setup(SWAGGER_PATH, app, document, { useGlobalPrefix: true });
}
