import React, { useEffect } from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { policies } from '../data/policies';
import { contact } from '../data/site';

export function Policy() {
  const { slug = '' } = useParams();
  const policy = policies.find((p) => p.slug === slug);

  useEffect(() => {
    if (policy) document.title = `${policy.title} — Arrow Ventures`;
  }, [policy]);

  if (!policy) return <Navigate to="/policies/refund" replace />;

  return (
    <div className="w-full bg-bg">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <nav aria-label="Policies" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-semibold text-fg">Policies</p>
          <ul className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:px-0">
            {policies.map((p) =>
            <li key={p.slug}>
                <NavLink
                to={`/policies/${p.slug}`}
                className={({ isActive }) =>
                `block whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                isActive ? 'bg-raised text-fg' : 'text-muted hover:text-fg'}`

                }>
                
                  {p.title}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <article className="max-w-3xl">
          <h1 className="break-words font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">{policy.title}</h1>
          <p className="mt-6 text-base leading-relaxed text-fg/85">{policy.intro}</p>

          <div className="mt-12 space-y-10">
            {policy.sections.map((section) =>
            <section key={section.heading}>
                <h2 className="text-lg font-semibold text-fg">{section.heading}</h2>
                {section.paragraphs?.map((p) =>
              <p key={p} className="mt-3 text-[15px] leading-relaxed text-muted">
                    {p}
                  </p>
              )}
                {section.bullets &&
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted marker:text-subtle">
                    {section.bullets.map((b) =>
                <li key={b}>{b}</li>
                )}
                  </ul>
              }
                {section.heading === 'Contact Us' &&
              <p className="mt-3 text-[15px] text-fg">
                    <a href={`mailto:${contact.email}`} className="underline underline-offset-2">
                      {contact.email}
                    </a>{' '}
                    ·{' '}
                    <a href={contact.phoneHref} className="underline underline-offset-2">
                      {contact.phone}
                    </a>
                  </p>
              }
              </section>
            )}
          </div>
        </article>
      </div>
    </div>);

}