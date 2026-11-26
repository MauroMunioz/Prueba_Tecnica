import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

// Sin 'use client': no tiene estado propio; se renderiza dentro de InventoryView

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  /** Deshabilita los controles mientras carga otra pagina */
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

type PageItem = number | 'gap';

/** Primera, ultima y las vecinas de la actual; el resto se resume con "..." */
function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? ['gap' as const, p] : [p]));
}

export function Pagination(props: PaginationProps) {
  const { page, totalPages, total, limit, disabled = false } = props;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="tabular-nums">
          Mostrando <span className="font-semibold text-slate-900">{formatNumber(first)}</span>
          –<span className="font-semibold text-slate-900">{formatNumber(last)}</span> de{' '}
          <span className="font-semibold text-slate-900">{formatNumber(total)}</span>
        </p>
        <label className="flex items-center gap-2">
          <span>Por página</span>
          <select
            value={limit}
            disabled={disabled}
            onChange={(event) => props.onLimitChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-slate-300 bg-white pr-7 pl-2.5 text-sm font-medium text-slate-900 shadow-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none disabled:text-slate-400"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip label="Página anterior">
          <Button
            variant="secondary"
            size="icon"
            disabled={disabled || page <= 1}
            onClick={() => props.onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </Button>
        </Tooltip>

        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="w-6 text-center text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => props.onPageChange(item)}
              aria-label={`Página ${item}`}
              aria-current={item === page ? 'page' : undefined}
              className={`h-8 min-w-8 rounded-lg px-2 font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed ${
                item === page
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-brand-50 hover:text-brand-800'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <Tooltip label="Página siguiente" align="end">
          <Button
            variant="secondary"
            size="icon"
            disabled={disabled || page >= totalPages}
            onClick={() => props.onPageChange(page + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight />
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
}
