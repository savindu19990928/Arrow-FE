import React from 'react';
import { ClockIcon, MailIcon, PhoneIcon, WrenchIcon } from 'lucide-react';
import { contact, WORKSHOP_IMAGE } from '../data/site';
import { warrantyCoverage, wearAndTearExamples } from '../data/maintenance';
import { MaintenanceFaq } from '../components/MaintenanceFaq';

export function Maintenance() {
  return (
    <div className="w-full bg-bg">
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:gap-10 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:px-8">
          <div>
            <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-fg sm:text-5xl md:text-6xl lg:text-7xl">
              Maintenance & repairs
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
              Warranty coverage, everyday wear and tear, and how to reach our certified service team.
            </p>
          </div>
          <img
            src={WORKSHOP_IMAGE}
            alt="Technician servicing an electric bike hub motor"
            className="aspect-[4/3] w-full rounded-xl border border-line object-cover" />

        </div>
      </section>

      <section aria-labelledby="warranty-heading" className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-12 lg:px-8">
          <div>
            <h2 id="warranty-heading" className="font-display text-2xl font-extrabold uppercase tracking-tight text-fg sm:text-3xl md:text-4xl">
              Manufacturing damages & warranty
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              At Arrow Ventures, we guarantee our craftsmanship. Any damages or defects arising from the manufacturing
              process are covered entirely by us. We do not charge for repairs or replacement parts related to
              manufacturing defects within your active warranty period.
            </p>
            <p className="mt-5 border-l-2 border-fg pl-4 text-[15px] leading-relaxed text-fg">
              If you believe your e-bike has a manufacturing issue, please contact us immediately with your order
              number and detailed photos of the issue so we can expedite your service.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-fg">Standard warranty coverage</h3>
            <table className="mt-4 w-full text-left">
              <caption className="sr-only">Standard warranty coverage by component</caption>
              <tbody className="divide-y divide-line border-y border-line">
                {warrantyCoverage.map((item) =>
                  <tr key={item.component}>
                    <th scope="row" className="py-4 pr-4 align-middle text-sm font-medium text-fg sm:py-6 sm:text-base md:text-lg">
                      {item.component}
                    </th>
                    <td className="whitespace-nowrap py-4 text-right align-middle sm:py-6">
                      <span className="font-display text-3xl font-extrabold tabular-nums text-fg sm:text-4xl md:text-5xl">{item.duration}</span>
                      <span className="ml-1.5 text-xs font-semibold uppercase text-muted sm:ml-2 sm:text-sm">{item.unit}</span>
                      {item.note && <span className="block text-xs text-subtle">{item.note}</span>}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="wear-heading" className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-12 lg:px-8">
          <div>
            <h2 id="wear-heading" className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg md:text-4xl">
              General wear & tear
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Standard wear and tear is a normal part of riding. While these are not covered under the manufacturing
              warranty, our certified technicians can guide you on the best replacement parts or direct you to an
              authorized Arrow Ventures service center near you.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {wearAndTearExamples.map((item) =>
                <li key={item} className="rounded-full border border-line px-3 py-1.5 text-sm text-fg">
                  {item}
                </li>
              )}
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-line bg-bg p-8 md:p-10">
            <WrenchIcon className="h-6 w-6 text-fg" aria-hidden="true" />
            <p className="mt-6 text-sm text-muted">We highly recommend a basic tune-up every</p>
            <p className="mt-2 break-words font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-fg sm:text-4xl md:text-5xl">
              6 months<br />
              <span className="mx-3 text-muted">or</span>
              <br />1,000 km
            </p>
            <p className="mt-4 text-sm text-muted">
              to ensure optimal performance and longevity of your e-bike components.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_2fr] lg:px-8">
          <h2 id="faq-heading" className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg md:text-4xl">
            Frequently asked questions
          </h2>
          <MaintenanceFaq />
        </div>
      </section>

      <section aria-labelledby="contact-heading">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <h2 id="contact-heading" className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg md:text-4xl">
            Contact service center
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-muted">
            Ready to initiate a repair request or claim a warranty? Reach out to our dedicated support team.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            <a href={contact.phoneHref} className="group flex flex-col bg-bg p-8 transition-colors duration-150 hover:bg-surface">
              <PhoneIcon className="h-5 w-5 text-muted" aria-hidden="true" />
              <span className="mt-6 text-sm text-subtle">Call us</span>
              <span className="mt-1 text-xl font-semibold text-fg group-hover:underline">{contact.phone}</span>
            </a>
            <a href={`mailto:${contact.email}`} className="group flex flex-col bg-bg p-8 transition-colors duration-150 hover:bg-surface">
              <MailIcon className="h-5 w-5 text-muted" aria-hidden="true" />
              <span className="mt-6 text-sm text-subtle">Email</span>
              <span className="mt-1 break-all text-xl font-semibold text-fg group-hover:underline">{contact.email}</span>
            </a>
            <div className="flex flex-col bg-bg p-8">
              <ClockIcon className="h-5 w-5 text-muted" aria-hidden="true" />
              <span className="mt-6 text-sm text-subtle">Support hours</span>
              <span className="mt-1 text-xl font-semibold text-fg">{contact.hours}</span>
            </div>
          </div>
        </div>
      </section>
    </div>);

}