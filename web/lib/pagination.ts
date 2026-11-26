// Tamanos de pagina que ofrece el selector. La API acepta de 1 a 100.
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 100] as const;

export const DEFAULT_PAGE_SIZE: number = PAGE_SIZE_OPTIONS[0];
