import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ArrowUpRightIcon, BoxIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { catalogApi, promoApi } from '../utils/shopApi';
import { formatDate } from '../utils/format';
import { HERO_IMAGE } from '../data/site';
import { warrantyCoverage } from '../data/maintenance';
import { ProductCard } from '../components/ProductCard';
import { buttonClasses } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { ProductGridSkeleton } from '../components/ui/ProductGridSkeleton';
import { MaintenanceNotice } from '../components/MaintenanceNotice';

export function Home({ showMaintenanceNotice = true }: {showMaintenanceNotice?: boolean;}) {
  const featured = useApi(() => catalogApi.products({ is_featured: true, page_size: 8 }), []);
  const categories = useApi(() => catalogApi.categories(), []);
  const campaigns = useApi(() => promoApi.campaigns(), []);
  const models3d = useApi(() => catalogApi.products({ has_3d_model: true, page_size: 3 }), []);

  const liveCampaigns = (campaigns.data ?? []).filter((c) => c.is_live ?? c.is_active);

  return (
    <div className="w-full bg-bg">
      {showMaintenanceNotice && <MaintenanceNotice />}
      <section className="relative isolate overflow-hidden border-b border-line">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-bg/40 md:bg-transparent" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 md:py-36 lg:px-8 lg:py-44">
          <h1 className="max-w-3xl break-words font-display text-[2.25rem] font-extrabold min-[400px]:text-[2.625rem] uppercase leading-[0.92] tracking-tight text-fg sm:text-6xl md:text-7xl lg:text-[88px]">
            Built to ride further.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-fg/75 sm:mt-6 md:text-lg">
            Electric bicycles, spare parts and accessories — inspect them in 3D, pay with Koko or Mintpay, and ride
            with a five-year frame warranty.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            <Link to="/catalog" className={buttonClasses('primary', 'lg')}>
              Shop the catalog
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/catalog?has_3d=true" className={`${buttonClasses('secondary', 'lg')} bg-bg/40`}>
              <BoxIcon className="h-4 w-4" aria-hidden="true" />
              Explore in 3D
            </Link>
          </div>
        </div>
      </section>

      {liveCampaigns.length > 0 &&
      <section aria-label="Current promotions" className="border-b border-line">
          <div className="mx-auto grid max-w-7xl gap-px bg-line md:grid-cols-2">
            {liveCampaigns.slice(0, 2).map((campaign) =>
          <div key={campaign.id} className="flex items-center gap-4 bg-bg px-4 py-6 sm:gap-6 sm:px-6 md:py-8 lg:px-8">
                {campaign.banner &&
            <img src={campaign.banner} alt="" className="hidden h-20 w-32 shrink-0 rounded-md object-cover sm:block" />
            }
                <div className="min-w-0">
                  {campaign.discount_percentage && Number(campaign.discount_percentage) > 0 &&
              <p className="text-sm font-semibold text-fg">Up to {Number(campaign.discount_percentage)}% off</p>
              }
                  <h2 className="mt-1 text-lg font-semibold text-fg">{campaign.title}</h2>
                  <p className="mt-1 text-sm text-muted">{campaign.description}</p>
                  <p className="mt-2 text-xs text-subtle">Ends {formatDate(campaign.end_date)}</p>
                </div>
              </div>
          )}
          </div>
        </section>
      }

      <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <h2 id="featured-heading" className="font-display text-2xl font-extrabold uppercase tracking-tight text-fg sm:text-3xl md:text-4xl">
              Featured
            </h2>
            <p className="mt-2 text-sm text-muted">Hand-picked by the Arrow Ventures team.</p>
          </div>
          <Link to="/catalog?featured=true" className="flex min-h-[2.5rem] shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-fg hover:underline">
            View all <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 md:mt-10">
          {featured.loading ?
          <ProductGridSkeleton count={4} /> :
          featured.error ?
          <ErrorState message={featured.error} onRetry={featured.reload} /> :
          !featured.data?.results.length ?
          <p className="text-sm text-muted">No featured products right now. Browse the full catalog instead.</p> :

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {featured.data.results.map((product) =>
            <ProductCard key={product.id} product={product} />
            )}
            </div>
          }
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <h2 id="categories-heading" className="font-display text-2xl font-extrabold uppercase tracking-tight text-fg sm:text-3xl md:text-4xl">
            Shop by category
          </h2>
          <div className="mt-8 md:mt-10">
            {categories.loading ?
            <div className="space-y-px" aria-hidden="true">
                {[0, 1, 2].map((i) =>
              <div key={i} className="h-24 animate-pulse border-t border-line bg-surface/40" />
              )}
              </div> :
            categories.error ?
            <ErrorState message={categories.error} onRetry={categories.reload} /> :

            <ul className="border-b border-line">
                {(categories.data ?? []).map((cat) =>
              <li key={cat.id} className="border-t border-line">
                    <Link
                  to={`/catalog?category=${cat.slug}`}
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-5 sm:gap-6 md:grid-cols-[1fr_1fr_auto] md:py-7">
                  
                      <span className="min-w-0 break-words font-display text-xl font-extrabold uppercase tracking-tight text-fg transition-transform duration-200 ease-out group-hover:translate-x-1 sm:text-2xl md:text-3xl">
                        {cat.name}
                      </span>
                      <span className="hidden text-sm text-muted md:block">{cat.description}</span>
                      <span className="flex items-center gap-3 sm:gap-4">
                        {cat.product_count !== undefined &&
                    <span className="whitespace-nowrap text-xs tabular-nums text-subtle sm:text-sm">{cat.product_count} items</span>
                    }
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors duration-150 group-hover:bg-fg group-hover:text-bg">
                          <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            }
          </div>
        </div>
      </section>

      {(models3d.loading || (models3d.data?.results.length ?? 0) > 0) &&
      <section aria-labelledby="threed-heading" className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_2fr] lg:gap-12 lg:px-8">
            <div className="lg:pt-4">
              <BoxIcon className="h-7 w-7 text-fg" aria-hidden="true" />
              <h2 id="threed-heading" className="mt-5 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-fg sm:text-3xl md:text-4xl">
                Inspect every angle before you buy
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
                Selected bikes and components come with an interactive 3D model. Rotate, zoom and examine the frame,
                motor and drivetrain right from the product page.
              </p>
              <Link to="/catalog?has_3d=true" className={`${buttonClasses('secondary', 'md')} mt-8`}>
                Browse 3D-ready products
              </Link>
            </div>
            {models3d.loading ?
          <ProductGridSkeleton count={3} className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3" /> :

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3">
                {(models3d.data?.results ?? []).map((product) =>
            <ProductCard key={product.id} product={product} />
            )}
              </div>
          }
          </div>
        </section>
      }

      <section aria-labelledby="warranty-heading" className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end md:gap-6">
            <div>
              <h2 id="warranty-heading" className="font-display text-2xl font-extrabold uppercase tracking-tight text-fg sm:text-3xl md:text-4xl">
                We stand behind every build
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                Manufacturing defects are repaired or replaced at no cost within your warranty period.
              </p>
            </div>
            <Link to="/maintenance" className="flex items-center gap-1.5 whitespace-nowrap text-sm text-fg hover:underline">
              Maintenance & warranty <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t border-line pt-8 md:mt-12 md:grid-cols-4 md:gap-y-10 md:pt-10">
            {warrantyCoverage.map((item) =>
            <div key={item.component} className="min-w-0 pr-3 sm:pr-4">
                <dd className="font-display text-3xl font-extrabold tabular-nums text-fg min-[400px]:text-4xl sm:text-5xl md:text-6xl">
                  {item.duration}
                  <span className="ml-1.5 text-base font-semibold uppercase text-muted">{item.unit}</span>
                </dd>
                <dt className="mt-2 text-sm text-muted">
                  {item.component}
                  {item.note && <span className="block text-xs text-subtle">{item.note}</span>}
                </dt>
              </div>
            )}
          </dl>
        </div>
      </section>
    </div>);

}