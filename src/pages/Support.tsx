import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MailIcon } from 'lucide-react';
import { paymentMethods } from '../data/paymentMethods';

export function Support() {
  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-12 md:px-10 md:pt-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Support</p>
        <h1 className="display mt-3 text-[48px] md:text-[72px]">How can we help?</h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Link to="/track" className="focus-ring group flex flex-col justify-between rounded-md bg-night p-8 text-snow ring-1 ring-line md:p-10">
            <div>
              <h2 className="display text-[36px] md:text-[44px]">Track an order</h2>
              <p className="mt-3 max-w-sm text-snow/70">Check delivery status, courier details and payment verification with your order number.</p>
            </div>
            <span className="mt-10 inline-flex items-center gap-2 self-start border-b-2 border-lime pb-1 text-sm font-medium">
              Track now <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
          <div className="rounded-md bg-white p-8">
            <h2 className="text-xl font-semibold">Talk to us</h2>
            <p className="mt-2 text-muted">Questions about a bike, a part or an order — we usually reply within one working day.</p>
            <a href="mailto:hello@arrowventures.lk" className="btn-secondary mt-6">
              <MailIcon className="h-4 w-4" aria-hidden /> hello@arrowventures.lk
            </a>
          </div>
        </div>

        <section className="mt-16 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="pay-h">
          <h2 id="pay-h" className="display text-[32px]">Payment options</h2>
          <dl className="divide-y divide-line border-y border-line">
            {paymentMethods.map((m) =>
            <div key={m.id} className="grid gap-1 py-5 md:grid-cols-[200px_1fr]">
                <dt className="font-medium">{m.title}</dt>
                <dd className="text-muted">{m.description}</dd>
              </div>
            )}
          </dl>
        </section>

        <section id="returns" className="mt-16 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="ret-h">
          <h2 id="ret-h" className="display text-[32px]">Cancellations & returns</h2>
          <div className="space-y-4 text-[16px] leading-relaxed text-ink/85">
            <p>You can request a cancellation from your account any time before your order is packed.</p>
            <p>If something arrives damaged or isn’t right, request a return or refund from the order page in your account. Our team reviews every request and keeps you updated by notification.</p>
            <p>Repairs and manufacturing defects are handled separately under your e-bike’s warranty.</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
              <Link to="/account?tab=orders" className="link-underline">
                Go to my orders <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/policies/refund" className="link-underline">
                Refund policy <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/maintenance" className="link-underline">
                Maintenance & warranty <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>);

}