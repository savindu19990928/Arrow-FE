import React from 'react';
import { Link } from 'react-router-dom';

export const LOGO_URL = "/Arrow_Ventures_Logo.jpg";

interface LogoProps {
  inverted?: boolean;
}

export function Logo({ inverted = false }: LogoProps) {
  // Light mode: mark blends into the page (or is inverted on dark footers).
  // Dark mode: the original black mark sits on a rounded white tile.
  const markClasses = inverted ?
  'invert dark:invert-0' :
  'mix-blend-multiply dark:mix-blend-normal';

  return (
    <Link to="/" className="focus-ring flex items-center gap-3 rounded-md" aria-label="Arrow Ventures home">
      <img
        src={LOGO_URL}
        alt=""
        className={`h-10 w-10 object-contain md:h-12 md:w-12 dark:rounded-xl dark:bg-snow dark:p-1 ${markClasses}`} />
      
      <span
        className={`font-display text-[19px] font-extrabold uppercase leading-[0.95] tracking-[0.06em] md:text-[22px] ${
        inverted ? 'text-snow' : 'text-ink'}`
        }
        style={{ fontStretch: '100%' }}>
        
        Arrow
        <br />
        Ventures
      </span>
    </Link>);

}