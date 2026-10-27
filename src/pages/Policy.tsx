import React, { useEffect } from 'react';
import { Link, Navigate, NavLink, useParams } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { policies } from '../data/policies';

export function Policy() {
  const { slug } = useParams();
  const policy = policies.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!policy) return <Navigate to="/policies/refund" replace />;

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-12 md:px-10 md:pt-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Policies</p>
        <h1 className="display mt-3 text-[44px] md:text-[64px]">{policy.title}</h1>

        <nav aria-label="Policies" className="mt-8 border-b border-line">
          <ul className="-mb-px flex gap-6 overflow-x-auto">
            {policies.map((p) =>
            <li key={p.slug}>
                <NavLink
                to={`/policies/${p.slug}`}
                className={({ isActive }) =>
                `focus-ring block whitespace-nowrap rounded-t border-b-2 pb-3 text-[15px] ${
                isActive ? 'border-lime-bright font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`

                }>
                
                  {p.navLabel}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block" aria-label="On this page">
            <div className="sticky top-[120px]">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">On this page</h2>
              <ul className="space-y-2 border-l border-line">
                {policy.sections.map((s) =>
                <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-[14px] text-muted hover:border-ink hover:text-ink">
                      {s.heading}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </aside>

          <article className="max-w-[720px]">
            <p className="text-[18px] leading-relaxed text-ink">{policy.intro}</p>

            <div className="mt-10 divide-y divide-line border-t border-line">
              {policy.sections.map((s) =>
              <section key={s.id} id={s.id} className="scroll-mt-[120px] py-8" aria-labelledby={`${s.id}-h`}>
                  <h2 id={`${s.id}-h`} className="text-[20px] font-semibold tracking-tight">
                    {s.heading}
                  </h2>
                  {s.paragraphs?.map((para) =>
                <p key={para} className="mt-3 text-[16px] leading-relaxed text-ink/80">
                      {para}
                    </p>
                )}
                  {s.list &&
                <ul className="mt-4 space-y-2.5">
                      {s.list.map((item) =>
                  <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-ink/80">
                          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime-bright" aria-hidden />
                          <span>{item}</span>
                        </li>
                  )}
                    </ul>
                }
                </section>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-4 rounded-md bg-white p-6 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] text-muted">Questions about this policy?</p>
              <div className="flex flex-wrap gap-3">
                <a href="mailto:hello@arrowventures.lk" className="btn-secondary py-2.5">
                  <MailIcon className="h-4 w-4" aria-hidden /> Email us
                </a>
                <Link to="/support" className="btn-primary py-2.5">
                  Visit support
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>);

}