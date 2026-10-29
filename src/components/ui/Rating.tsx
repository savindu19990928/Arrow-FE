import React from 'react';
import { StarIcon } from 'lucide-react';
import { toNumber } from '../../utils/format';

interface RatingProps {
  value: string | number | null;
  count?: number;
  size?: 'sm' | 'md';
}

export function Rating({ value, count, size = 'sm' }: RatingProps) {
  const rating = toNumber(value);
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  if (!rating && !count) return <span className="text-xs text-subtle">No reviews yet</span>;
  return (
    <span className={`inline-flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-muted`}>
      <span className="sr-only">Rated {rating.toFixed(1)} out of 5</span>
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) =>
        <StarIcon
          key={i}
          className={`${iconSize} ${i < Math.round(rating) ? 'fill-fg text-fg' : 'text-subtle'}`} />

        )}
      </span>
      <span className="text-fg/80" aria-hidden="true">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && <span>({count})</span>}
    </span>);

}