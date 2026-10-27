import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { useCatalog } from '../../contexts/CatalogContext';

export const HERO_IMAGE_DARK = "/4e1128ad-5ed2-4ff3-989c-b85fe9ab5d4c.jpg";
export const HERO_IMAGE = "/ec2e8297-7242-4efc-8f32-139be8185cbc.jpg";

export function HeroSection() {
  const { bikeCategory } = useCatalog();
  const bikesHref = bikeCategory ? `/shop?category=${bikeCategory.slug}` : '/shop';

  return (
    <section className="overflow-hidden bg-canvas" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-site items-center gap-6 px-5 pb-12 pt-12 md:px-10 md:pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:pb-20 lg:pt-16">
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-lime px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-ink">
            New generation e-bikes
          </span>
          <h1 id="hero-title" className="display mt-6 text-[56px] sm:text-[76px] lg:text-[96px]">
            Ride beyond.
            <br />
            Go electric.
          </h1>
          <p className="mt-7 max-w-[380px] text-lg leading-relaxed text-ink/85">
            Discover electric bikes built for everyday freedom, longer adventures, and a smarter way to move.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-8">
            <Link to={bikesHref} className="btn-primary focus-ring">
              Shop e-bikes <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/shop" className="link-underline focus-ring">
              Explore the range <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative -mx-5 md:mx-0 lg:-mr-16">
          
          <img
            src={HERO_IMAGE}
            alt="Arrow Ventures electric mountain bike in matte black with lime accents"
            className="w-full object-contain mix-blend-multiply dark:hidden" />
          
          <img
            src={HERO_IMAGE_DARK}
            alt="Arrow Ventures electric mountain bike in matte black with lime accents"
            className="hidden w-full object-contain mix-blend-lighten dark:block" />
          
        </motion.div>
      </div>
    </section>);

}