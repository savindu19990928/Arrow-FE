import React from 'react';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 8,
  className = 'grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4'
}: ProductGridSkeletonProps) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) =>
      <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] rounded-lg bg-surface" />
          <div className="mt-4 h-3 w-1/3 rounded bg-surface" />
          <div className="mt-2 h-4 w-3/4 rounded bg-surface" />
          <div className="mt-4 h-4 w-1/2 rounded bg-surface" />
        </div>
      )}
    </div>);

}