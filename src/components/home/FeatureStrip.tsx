import React from 'react';
import { BatteryChargingIcon, GaugeIcon, ShieldCheckIcon } from 'lucide-react';
import { brandFeatures, type BrandFeatureIcon } from '../../data/brandFeatures';

function SaddleIcon({ className }: {className?: string;}) {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 9c0-3 3-5 9-5 6 0 10 2 18 2 6 0 13-1 13 3s-7 5-13 6c-4 1-7 3-12 3C10 18 4 13 4 9Z" />
      <path d="M20 18l-4 11M26 17l-3 12" />
    </svg>);

}

const icons: Record<BrandFeatureIcon, React.ReactNode> = {
  battery: <BatteryChargingIcon className="h-10 w-10 -rotate-90 text-ink" strokeWidth={1.4} />,
  gauge: <GaugeIcon className="h-10 w-10 text-ink" strokeWidth={1.4} />,
  saddle: <SaddleIcon className="h-9 w-12 text-ink" />,
  shield: <ShieldCheckIcon className="h-10 w-10 text-ink" strokeWidth={1.4} />
};

export function FeatureStrip() {
  return (
    <section aria-label="Why Arrow Ventures" className="bg-paper">
      <ul className="mx-auto grid max-w-site grid-cols-2 px-5 py-8 md:px-10 lg:grid-cols-4 lg:py-10">
        {brandFeatures.map((f, i) =>
        <li
          key={f.title}
          className={`flex items-center gap-4 px-2 py-4 lg:justify-center lg:px-6 ${
          i > 0 ? 'lg:border-l lg:border-line' : ''}`
          }>
          
            <span className="shrink-0 [&_svg]:drop-shadow-none">{icons[f.icon]}</span>
            <span className="max-w-[120px] text-[16px] leading-snug text-ink">{f.title}</span>
          </li>
        )}
      </ul>
    </section>);

}