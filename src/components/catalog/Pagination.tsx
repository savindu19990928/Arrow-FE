import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);
  const base =
  'flex h-11 min-w-[2.75rem] items-center justify-center rounded-md px-2 text-sm tabular-nums transition-colors duration-150 sm:h-10 sm:min-w-[2.5rem] sm:px-3';
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
      <button
        type="button"
        className={`${base} text-muted hover:bg-raised hover:text-fg disabled:opacity-40`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page">
        
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
      p === 'gap' ?
      <span key={`gap-${i}`} className="px-1 text-subtle sm:px-2" aria-hidden="true">
            …
          </span> :

      <button
        key={p}
        type="button"
        onClick={() => onChange(p)}
        aria-current={p === page ? 'page' : undefined}
        className={`${base} ${p === page ? 'bg-fg text-bg' : 'text-muted hover:bg-raised hover:text-fg'}`}>
        
            {p}
          </button>

      )}
      <button
        type="button"
        className={`${base} text-muted hover:bg-raised hover:text-fg disabled:opacity-40`}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page">
        
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>);

}

function buildPages(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) result.push('gap');
  for (let p = start; p <= end; p += 1) result.push(p);
  if (end < total - 1) result.push('gap');
  result.push(total);
  return result;
}