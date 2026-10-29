import React from 'react';
import { Link } from 'react-router-dom';
import { contact, footerGroups } from '../../data/site';
import { BrandMark } from './BrandMark';

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            Electric bicycles, spare parts and accessories — sold, serviced and warrantied by Arrow Ventures.
          </p>
          <div className="mt-6 space-y-1.5 text-sm">
            <a href={contact.phoneHref} className="block text-fg hover:underline">
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="block text-fg hover:underline">
              {contact.email}
            </a>
            <p className="text-subtle">{contact.hours}</p>
          </div>
        </div>
        {footerGroups.map((group) =>
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold text-fg">{group.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) =>
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted transition-colors duration-150 hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          {/* <p>© {new Date().getFullYear()} Arrow Ventures. All rights reserved.</p> */}
          <p>Made by <a href="https://www.devrious.lk" target="_blank">Devrious</a></p>
        </div>
      </div>
    </footer>);

}