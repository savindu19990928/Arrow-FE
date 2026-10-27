import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/product/ProductCardSkeleton';
import { ShopFilters, type ShopFilterValues } from '../components/shop/ShopFilters';
import { StateMessage } from '../components/StateMessage';
import { useApi } from '../hooks/useApi';
import { useCatalog } from '../contexts/CatalogContext';
import { catalogApi } from '../utils/storeApi';

const PAGE_SIZE = 12;

const sortOptions = [
{ value: '', label: 'Recommended' },
{ value: '-created_at', label: 'Newest' },
{ value: 'price', label: 'Price: low to high' },
{ value: '-price', label: 'Price: high to low' },
{ value: '-average_rating', label: 'Top rated' }];


export function Shop() {
  const [params, setParams] = useSearchParams();
  const { categories, brands } = useCatalog();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters: ShopFilterValues = {
    category: params.get('category') ?? '',
    brand: params.get('brand') ?? '',
    min_price: params.get('min_price') ?? '',
    max_price: params.get('max_price') ?? '',
    in_stock: params.get('in_stock') === 'true',
    is_featured: params.get('is_featured') === 'true'
  };
  const search = params.get('search') ?? '';
  const ordering = params.get('ordering') ?? '';
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => setSearchDraft(search), [search]);

  const key = params.toString();
  const { data, loading, error, reload } = useApi(
    () =>
    catalogApi.products({
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      min_price: filters.min_price || undefined,
      max_price: filters.max_price || undefined,
      in_stock: filters.in_stock || undefined,
      is_featured: filters.is_featured || undefined,
      search: search || undefined,
      ordering: ordering || undefined,
      page,
      page_size: PAGE_SIZE
    }),
    [key]
  );

  const update = (patch: Record<string, string | boolean | number | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === false) next.delete(k);else
      next.set(k, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === filters.category) ?? null,
    [categories, filters.category]
  );

  const activeBrand = useMemo(
    () => brands.find((b) => b.slug === filters.brand) ?? null,
    [brands, filters.brand]
  );

  const title = search ?
  `Results for “${search}”` :
  activeCategory?.name ?? (filters.is_featured ? 'Featured' : 'All products');

  const activeChips: {key: string;label: string;}[] = [
  activeCategory && { key: 'category', label: activeCategory.name },
  activeBrand && { key: 'brand', label: activeBrand.name },
  (filters.min_price || filters.max_price) && {
    key: 'price',
    label: `LKR ${filters.min_price || '0'} – ${filters.max_price || 'any'}`
  },
  filters.is_featured && { key: 'is_featured', label: 'Featured' },
  filters.in_stock && { key: 'in_stock', label: 'In stock' }].
  filter(Boolean) as {key: string;label: string;}[];

  const removeChip = (key: string) =>
  key === 'price' ? update({ min_price: '', max_price: '' }) : update({ [key]: '' });
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  const filterPanel =
  <ShopFilters values={filters} onChange={(p) => update(p)} onClear={() => setParams(new URLSearchParams())} />;


  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-10 md:px-10 md:pt-14">
        <header className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Products</p>
            <h1 className="display mt-3 text-[44px] md:text-[64px]">{title}</h1>
            {activeCategory?.description && !search &&
            <p className="mt-3 max-w-xl text-[16px] text-muted">{activeCategory.description}</p>
            }
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ search: searchDraft.trim() });
            }}
            className="flex w-full items-center gap-2 lg:w-[360px]">
            
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
              <input
                id="shop-search"
                className="field pl-9"
                placeholder="Search name, SKU, brand…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)} />
              
            </div>
            <button type="submit" className="btn-primary px-4 py-3">
              Search
            </button>
          </form>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            {filterPanel}
          </aside>

          <section aria-label="Products">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="mr-2 text-[15px] text-muted" aria-live="polite">
                  {loading ? 'Loading products…' : data ? `${data.count} product${data.count === 1 ? '' : 's'}` : ''}
                </p>
                {activeChips.map((chip) =>
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-3 pr-2 text-[13px] font-medium text-ink hover:border-ink"
                  aria-label={`Remove filter: ${chip.label}`}>
                  
                    {chip.label}
                    <XIcon className="h-3.5 w-3.5 text-subtle" aria-hidden />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="btn-secondary py-2.5 lg:hidden" onClick={() => setFiltersOpen(true)}>
                  <SlidersHorizontalIcon className="h-4 w-4" aria-hidden /> Filters
                </button>
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  className="field w-auto py-2.5 pr-8"
                  value={ordering}
                  onChange={(e) => update({ ordering: e.target.value })}>
                  
                  {sortOptions.map((o) =>
                  <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  )}
                </select>
              </div>
            </div>

            {error ?
            <StateMessage tone="error" title="We couldn’t load products" description={error} onRetry={reload} /> :
            loading || !data ?
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) =>
              <ProductCardSkeleton key={i} />
              )}
              </div> :
            data.results.length === 0 ?
            <StateMessage
              title="No products match"
              description="Try a different search or remove a filter to see more products."
              action={
              <button type="button" className="btn-primary" onClick={() => setParams(new URLSearchParams())}>
                    Clear filters
                  </button>
              } /> :


            <>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.results.map((p) =>
                <li key={p.id}>
                      <ProductCard product={p} />
                    </li>
                )}
                </ul>
                {totalPages > 1 &&
              <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
                    <button type="button" className="btn-secondary" disabled={!data.previous} onClick={() => update({ page: page - 1 })}>
                      Previous
                    </button>
                    <span className="text-sm text-muted">
                      Page {page} of {totalPages}
                    </span>
                    <button type="button" className="btn-secondary" disabled={!data.next} onClick={() => update({ page: page + 1 })}>
                      Next
                    </button>
                  </nav>
              }
              </>
            }
          </section>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen &&
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFiltersOpen(false)} />
          
            <motion.div
            className="absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-paper p-6"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
            
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button type="button" onClick={() => setFiltersOpen(false)} className="focus-ring rounded p-1" aria-label="Close filters">
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              {filterPanel}
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}