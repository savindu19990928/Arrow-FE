import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PackageSearchIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { catalogApi } from '../utils/shopApi';
import { sortOptions } from '../data/site';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import type { CatalogFilterValues } from '../components/catalog/CatalogFilters';
import { Pagination } from '../components/catalog/Pagination';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ProductGridSkeleton } from '../components/ui/ProductGridSkeleton';

const PAGE_SIZE = 24;

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const search = params.get('search') ?? '';
  const ordering = params.get('ordering') ?? '-created_at';
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
  const values: CatalogFilterValues = {
    category: params.get('category') ?? '',
    brand: params.get('brand') ?? '',
    featured: params.get('featured') === 'true',
    inStock: params.get('in_stock') === 'true',
    has3d: params.get('has_3d') === 'true',
    minPrice: params.get('min_price') ?? '',
    maxPrice: params.get('max_price') ?? ''
  };

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const categories = useApi(() => catalogApi.categories(), []);
  const brands = useApi(() => catalogApi.brands(), []);
  const products = useApi(
    () =>
    catalogApi.products({
      search: search || undefined,
      category: values.category || undefined,
      brand: values.brand || undefined,
      is_featured: values.featured || undefined,
      in_stock: values.inStock || undefined,
      has_3d_model: values.has3d || undefined,
      min_price: values.minPrice || undefined,
      max_price: values.maxPrice || undefined,
      ordering,
      page,
      page_size: PAGE_SIZE
    }),
    [params.toString()]
  );

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);else
      next.set(key, value);
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const activeChips = useMemo(() => {
    const chips: {key: string;label: string;patch: Record<string, string | null>;}[] = [];
    if (search) chips.push({ key: 'search', label: `“${search}”`, patch: { search: null } });
    if (values.featured) chips.push({ key: 'featured', label: 'Featured', patch: { featured: null } });
    if (values.inStock) chips.push({ key: 'in_stock', label: 'In stock', patch: { in_stock: null } });
    if (values.has3d) chips.push({ key: 'has_3d', label: '3D view', patch: { has_3d: null } });
    if (values.category) {
      const name = categories.data?.find((c) => c.slug === values.category)?.name ?? values.category;
      chips.push({ key: 'category', label: name, patch: { category: null } });
    }
    if (values.brand) {
      const name = brands.data?.find((b) => b.slug === values.brand)?.name ?? values.brand;
      chips.push({ key: 'brand', label: name, patch: { brand: null } });
    }
    if (values.minPrice || values.maxPrice) {
      chips.push({
        key: 'price',
        label: `LKR ${values.minPrice || '0'} – ${values.maxPrice || 'any'}`,
        patch: { min_price: null, max_price: null }
      });
    }
    return chips;
  }, [search, values.featured, values.inStock, values.has3d, values.category, values.brand, values.minPrice, values.maxPrice, categories.data, brands.data]);

  const clearAll = () => setParams(ordering !== '-created_at' ? { ordering } : {});
  const total = products.data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filters =
  <CatalogFilters
    values={values}
    categories={categories.data ?? []}
    brands={brands.data ?? []}
    loadingOptions={categories.loading || brands.loading}
    onChange={update} />;



  return (
    <div className="w-full bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">Catalog</h1>
        <p className="mt-2 text-sm text-muted">Electric bikes, spare parts, batteries and accessories in one place.</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24">{filters}</div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center">
              <form
                role="search"
                className="relative flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  update({ search: searchInput.trim() || null });
                }}>
                
                <label htmlFor="catalog-search" className="sr-only">
                  Search catalog
                </label>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <input
                  id="catalog-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, SKU or brand"
                  className="h-11 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-subtle focus:border-fg/50 focus:outline-none" />
                
              </form>
              <div className="flex gap-3">
                <Button variant="secondary" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
                  <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                  Filters{activeChips.length ? ` (${activeChips.length})` : ''}
                </Button>
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={ordering}
                  onChange={(e) => update({ ordering: e.target.value })}
                  className="h-11 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-fg focus:border-fg/50 focus:outline-none sm:w-52 sm:flex-none">
                  
                  {sortOptions.map((opt) =>
                  <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex min-h-[52px] flex-wrap items-center gap-2 py-4">
              <p className="mr-2 text-sm text-muted" aria-live="polite">
                {products.loading ? 'Loading products…' : `${total} ${total === 1 ? 'product' : 'products'}`}
              </p>
              {activeChips.map((chip) =>
              <button
                key={chip.key}
                type="button"
                onClick={() => update(chip.patch)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-fg transition-colors duration-150 hover:border-fg/40"
                aria-label={`Remove filter ${chip.label}`}>
                
                  {chip.label}
                  <XIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
              {activeChips.length > 1 &&
              <button type="button" onClick={clearAll} className="text-xs text-muted underline-offset-2 hover:text-fg hover:underline">
                  Clear all
                </button>
              }
            </div>

            {products.loading ?
            <ProductGridSkeleton count={9} className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3" /> :
            products.error ?
            <ErrorState title="Couldn't load products" message={products.error} onRetry={products.reload} /> :
            !products.data?.results.length ?
            <EmptyState
              icon={PackageSearchIcon}
              title="No products match these filters"
              message="Try removing a filter or searching for something else."
              action={
              activeChips.length ?
              <Button variant="secondary" onClick={clearAll}>
                      Clear filters
                    </Button> :
              undefined
              } /> :


            <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                  {products.data.results.map((product) =>
                <ProductCard key={product.id} product={product} />
                )}
                </div>
                <div className="mt-14">
                  <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) => {
                    update({ page: String(p) });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} />
                
                </div>
              </>
            }
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen &&
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div
            className="absolute inset-0 bg-bg/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawerOpen(false)} />
          
            <motion.div
            className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col border-r border-line bg-bg"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}>
            
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <h2 className="text-base font-semibold text-fg">Filters</h2>
                <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-fg"
                aria-label="Close filters">
                
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
              <div className="border-t border-line p-4">
                <Button fullWidth onClick={() => setDrawerOpen(false)}>
                  Show {total} {total === 1 ? 'product' : 'products'}
                </Button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}