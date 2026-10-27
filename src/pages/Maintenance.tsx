import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon, MailIcon, PhoneIcon, PlusIcon } from 'lucide-react';
import { maintenanceFaqs, serviceContact, warrantyCoverage, wearAndTearExamples } from '../data/maintenance';

export function Maintenance() {
  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-12 md:px-10 md:pt-16">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Maintenance</p>
          <h1 className="display mt-3 text-[48px] md:text-[72px]">Repairs & warranty</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">
            At Arrow Ventures, we guarantee our craftsmanship. Any damages or defects arising from the manufacturing process are
            covered entirely by us.
          </p>
        </header>

        {/* Manufacturing damages & warranty */}
        <section className="mt-14 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="warranty-h">
          <div>
            <h2 id="warranty-h" className="display text-[32px]">
              Manufacturing damages & warranty
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-[16px] leading-relaxed text-ink/85">
              We do not charge for repairs or replacement parts related to manufacturing defects within your active warranty period.
            </p>

            <div className="mt-8 overflow-hidden rounded-md bg-white ring-1 ring-line">
              <h3 className="border-b border-line px-6 py-4 text-sm font-semibold uppercase tracking-wide">
                Standard warranty coverage
              </h3>
              <dl className="divide-y divide-line">
                {warrantyCoverage.map((row) =>
                <div key={row.component} className="flex items-baseline justify-between gap-6 px-6 py-5">
                    <dt className="text-[16px] font-medium">{row.component}</dt>
                    <dd className="text-right">
                      <span className="display text-[28px] md:text-[32px]">{row.duration}</span>
                      {row.note && <span className="mt-1 block text-[13px] text-muted">{row.note}</span>}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <p className="mt-6 max-w-2xl rounded-md border-l-2 border-lime-bright bg-white px-5 py-4 text-[15px] leading-relaxed text-ink/85">
              If you believe your e-bike has a manufacturing issue, please contact us immediately with your{' '}
              <strong className="font-semibold text-ink">order number</strong> and{' '}
              <strong className="font-semibold text-ink">detailed photos of the issue</strong> so we can expedite your service.
            </p>
          </div>
        </section>

        {/* General wear & tear */}
        <section className="mt-16 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="wear-h">
          <h2 id="wear-h" className="display text-[32px]">
            General wear & tear
          </h2>
          <div className="max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              Standard wear and tear is a normal part of riding. While these are not covered under the manufacturing warranty, our
              certified technicians can guide you on the best replacement parts or direct you to an authorized Arrow Ventures
              service center near you.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Examples of wear and tear">
              {wearAndTearExamples.map((item) =>
              <li key={item} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] text-ink">
                  {item}
                </li>
              )}
            </ul>
            <div className="flex items-start gap-4 rounded-md bg-night p-6 text-snow">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-lime" aria-hidden />
              <p className="text-[15px] leading-relaxed text-snow/85">
                We highly recommend a basic tune-up every{' '}
                <span className="font-semibold text-snow">6 months or 1,000 kilometers</span> to ensure optimal performance and
                longevity of your e-bike components.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="faq-h">
          <h2 id="faq-h" className="display text-[32px]">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl divide-y divide-line border-y border-line">
            {maintenanceFaqs.map((faq, i) =>
            <details key={faq.question} className="group" open={i === 0}>
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 rounded py-5 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <PlusIcon
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-45"
                  aria-hidden />
                
                </summary>
                <p className="-mt-1 pb-6 pr-10 text-[16px] leading-relaxed text-muted">{faq.answer}</p>
              </details>
            )}
          </div>
        </section>

        {/* Contact service center */}
        <section
          className="mt-16 grid gap-10 rounded-md bg-night p-8 text-snow md:p-12 lg:grid-cols-[1fr_auto] lg:items-end"
          aria-labelledby="service-h">
          
          <div className="max-w-lg">
            <h2 id="service-h" className="display text-[36px] md:text-[48px]">
              Contact service center
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-snow/70">
              Ready to initiate a repair request or claim a warranty? Reach out to our dedicated support team.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-snow/60">
              <ClockIcon className="h-4 w-4" aria-hidden />
              Support hours: {serviceContact.hours}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href={serviceContact.phoneHref}
              className="focus-ring inline-flex items-center gap-3 rounded-md bg-lime px-6 py-4 text-[16px] font-semibold text-night transition-colors duration-150 ease-out hover:bg-lime-bright">
              
              <PhoneIcon className="h-5 w-5" aria-hidden />
              {serviceContact.phone}
            </a>
            <a
              href={`mailto:${serviceContact.email}`}
              className="focus-ring inline-flex items-center gap-3 rounded-md px-6 py-4 text-[16px] font-medium text-snow ring-1 ring-snow/25 transition-colors duration-150 ease-out hover:bg-snow/10">
              
              <MailIcon className="h-5 w-5" aria-hidden />
              {serviceContact.email}
            </a>
          </div>
        </section>

        <p className="mt-10 text-[15px] text-muted">
          Looking for returns on a recent order?{' '}
          <Link to="/policies/refund" className="link-underline ml-1">
            Read our refund policy <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </div>);

}