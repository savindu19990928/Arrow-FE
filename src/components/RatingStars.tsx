import React from 'react';
import { StarIcon } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function RatingStars({ rating, size = 'sm' }: RatingStarsProps) {
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]';
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) =>
      <StarIcon
        key={i}
        aria-hidden
        className={`${dim} ${i <= Math.round(rating) ? 'fill-ink text-ink' : 'fill-transparent text-ink/25'}`} />

      )}
    </span>);

}