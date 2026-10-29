import React from 'react';
import { LOGO_URL } from '../../data/site';

export function BrandMark({ size = 'md' }: {size?: 'md' | 'lg';}) {
  return (
    <span className="flex items-center gap-3">
      <img
        src={LOGO_URL}
        alt=""
        className={`${size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'} object-contain invert mix-blend-screen`} />
      
      <span className="font-display text-[15px] font-extrabold uppercase leading-none tracking-wide text-fg">
        Arrow Ventures
      </span>
    </span>);

}