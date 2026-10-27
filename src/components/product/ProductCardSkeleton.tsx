import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-md bg-white p-3" aria-hidden>
      <div className="aspect-[1.08] animate-pulse rounded-sm bg-canvas" />
      <div className="space-y-3 px-2.5 pb-3 pt-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-canvas" />
        <div className="h-3.5 w-full animate-pulse rounded bg-canvas" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-canvas" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-canvas pt-4" />
      </div>
    </div>);

}