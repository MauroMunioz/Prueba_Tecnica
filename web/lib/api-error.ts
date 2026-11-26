/**
 * Error de una llamada a la API. Guarda el status HTTP y el campo message del
 * cuerpo de error de Nest, que es un texto o, en errores de validacion, una lista.
 * status 0 significa que no hubo respuesta (red caida o API inaccesible).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly apiMessage: string | string[];

  constructor(status: number, apiMessage: string | string[]) {
    super(Array.isArray(apiMessage) ? apiMessage.join('. ') : apiMessage);
    this.name = 'ApiError';
    this.status = status;
    this.apiMessage = apiMessage;
  }

  /** El message de Nest siempre como lista */
  get messages(): string[] {
    return Array.isArray(this.apiMessage) ? this.apiMessage : [this.apiMessage];
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Ocurrio un error inesperado. Intenta de nuevo.';
}
