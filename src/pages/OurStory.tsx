import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { STORY_IMAGE } from '../components/auth/AuthShell';

export function OurStory() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-site px-5 pb-12 pt-14 md:px-10 md:pt-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Our story</p>
        <h1 className="display mt-4 max-w-4xl text-[52px] md:text-[88px]">
          Built for the roads
          <br />
          we ride every day
        </h1>
      </section>
      <img src={STORY_IMAGE} alt="Rider on an Arrow Ventures e-bike through Sri Lankan tea country" className="h-[300px] w-full object-cover md:h-[520px]" />
      <section className="mx-auto grid max-w-site gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="display text-[36px] md:text-[48px]">Electric, made practical</h2>
        <div className="space-y-5 text-[18px] leading-relaxed text-ink/85">
          <p>
            Arrow Ventures started with a simple idea: an electric bike should handle a Colombo commute on Monday and a Kandy hill climb on Saturday — without compromise.
          </p>
          <p>
            We select every bike, battery and component for Sri Lankan heat, rain and gradients, and we back them with real warranties and local service. Not sure what fits? Inspect selected models in 3D, compare specs, and pay the way that suits you.
          </p>
          <Link to="/shop" className="link-underline mt-4">
            Explore the range <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>);

}