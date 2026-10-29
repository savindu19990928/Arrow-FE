import React from 'react';
import { LOGO_URL } from '../../data/site';

export function BrandMark({ size = 'md' }: {size?: 'md' | 'lg';}) {
  return (
    <span className="flex min-w-0 items-center gap-2 sm:gap-3">
      <img
        src={LOGO_URL}
        alt=""
        className={`${size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'} shrink-0 object-contain invert mix-blend-screen`} />
      
      <span className="truncate whitespace-nowrap font-display text-[13px] font-extrabold uppercase leading-none tracking-wide text-fg min-[400px]:text-[15px]">
        Arrow Ventures
      </span>
    </span>);

}