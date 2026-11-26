import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export const API_PREFIX = 'api';

// class-validator no traduce el mensaje de forbidNonWhitelisted
const WHITELIST_CONSTRAINT = 'whitelistValidation';

function toMessages(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.entries(error.constraints ?? {}).map(([key, message]) =>
      key === WHITELIST_CONSTRAINT
        ? `La propiedad "${path}" no esta permitida`
        : message,
    );
    return [...own, ...toMessages(error.children ?? [], path)];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    // Un mensaje por campo: el de la primera regla que falla
    stopAtFirstError: true,
    // Necesario para que el handler reciba la instancia del DTO con los valores ya recortados
    transform: true,
    exceptionFactory: (errors) => new BadRequestException(toMessages(errors)),
  });
}

/**
 * Configuracion comun de la aplicacion. Se llama desde main.ts y desde los
 * tests e2e para que ambos se comporten igual.
 */
export function configureApp(app: INestApplication): INestApplication {
  // Todas las rutas cuelgan de /api; el frontend reenvia /api/* a esta API
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(createValidationPipe());
  return app;
}
