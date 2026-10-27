import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import { useCatalog } from '../../contexts/CatalogContext';
import { policies } from '../../data/policies';

export function Footer() {
  const { categories } = useCatalog();
  const roots = categories.filter((c) => !c.parent).slice(0, 4);
  const linkClass = 'transition-colors duration-150 ease-out hover:text-snow';
  const headingClass = 'text-sm font-semibold uppercase tracking-wide text-snow';
  const listClass = 'mt-4 space-y-2.5 text-[15px] text-snow/70';

  return (
    <footer className="border-t border-transparent bg-night text-snow dark:border-line">
      <div className="mx-auto grid max-w-site gap-10 px-5 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:gap-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo inverted />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-snow/70">
            Electric bikes, parts and accessories built for Sri Lankan roads — from city commutes to hill-country trails.
          </p>
        </div>

        <div>
          <h2 className={headingClass}>Products</h2>
          <ul className={listClass}>
            <li>
              <Link to="/shop" className={linkClass}>
                All products
              </Link>
            </li>
            {roots.map((c) =>
            <li key={c.id}>
                <Link to={`/shop?category=${c.slug}`} className={linkClass}>
                  {c.name}
                </Link>
              </li>
            )}
            <li>
              <Link to="/shop?is_featured=true" className={linkClass}>
                Featured
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Help</h2>
          <ul className={listClass}>
            <li>
              <Link to="/track" className={linkClass}>
                Track an order
              </Link>
            </li>
            <li>
              <Link to="/maintenance" className={linkClass}>
                Maintenance & warranty
              </Link>
            </li>
            <li>
              <Link to="/support" className={linkClass}>
                Payments & delivery
              </Link>
            </li>
            <li>
              <Link to="/account" className={linkClass}>
                My account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Policies</h2>
          <ul className={listClass}>
            {policies.map((p) =>
            <li key={p.slug}>
                <Link to={`/policies/${p.slug}`} className={linkClass}>
                  {p.navLabel}
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Company</h2>
          <ul className={listClass}>
            <li>
              <Link to="/our-story" className={linkClass}>
                Our story
              </Link>
            </li>
            <li>
              <a href="mailto:hello@arrowventures.lk" className={`${linkClass} break-all`}>
                hello@arrowventures.lk
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-snow/10">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-5 py-6 text-sm text-snow/60 md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Arrow Ventures (Pvt) Ltd. All rights reserved.</p>
          <p>
            Made by{' '}
            <a
              href="https://www.devrious.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-snow underline decoration-snow/30 underline-offset-4 transition-colors duration-150 ease-out hover:decoration-lime">
              
              Devrious
            </a>
          </p>
        </div>
      </div>
    </footer>);

}