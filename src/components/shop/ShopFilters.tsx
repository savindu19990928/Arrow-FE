import React, { useEffect, useState } from 'react';
import { useCatalog } from '../../contexts/CatalogContext';

export interface ShopFilterValues {
  category: string;
  brand: string;
  min_price: string;
  max_price: string;
  in_stock: boolean;
  is_featured: boolean;
}

interface ShopFiltersProps {
  values: ShopFilterValues;
  onChange: (patch: Partial<ShopFilterValues>) => void;
  onClear: () => void;
}

const headingClass = 'mb-3 text-sm font-semibold uppercase tracking-wide';

export function ShopFilters({ values, onChange, onClear }: ShopFiltersProps) {
  const { categories, loading, brands, brandsLoading } = useCatalog();
  const [min, setMin] = useState(values.min_price);
  const [max, setMax] = useState(values.max_price);

  useEffect(() => {
    setMin(values.min_price);
    setMax(values.max_price);
  }, [values.min_price, values.max_price]);

  const roots = categories.filter((c) => !c.parent);
  const childrenOf = (id: number) => categories.filter((c) => c.parent === id);

  const optionButton = (
  active: boolean,
  onClick: () => void,
  label: string,
  count?: number,
  nested = false) =>

  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`focus-ring flex w-full items-center justify-between rounded py-1.5 text-left text-[15px] ${
    nested ? 'pl-4' : ''} ${
    active ? 'font-medium text-ink' : 'text-muted hover:text-ink'}`}>
    
      <span className="flex items-center gap-2">
        <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-lime-bright' : 'bg-transparent'}`}
        aria-hidden />
      
        {label}
      </span>
      {typeof count === 'number' && <span className="text-xs tabular-nums text-subtle">{count}</span>}
    </button>;


  const skeleton =
  <div className="space-y-2" aria-hidden>
      {[0, 1, 2, 3].map((i) =>
    <div key={i} className="h-5 w-3/4 animate-pulse rounded bg-line/60" />
    )}
    </div>;


  return (
    <div className="space-y-8">
      <div>
        <h3 className={headingClass}>Category</h3>
        {loading ?
        skeleton :

        <ul className="space-y-0.5">
            <li>{optionButton(values.category === '', () => onChange({ category: '' }), 'All categories')}</li>
            {roots.map((c) =>
          <li key={c.id}>
                {optionButton(values.category === c.slug, () => onChange({ category: c.slug }), c.name, c.product_count)}
                {childrenOf(c.id).length > 0 &&
            <ul>
                    {childrenOf(c.id).map((child) =>
              <li key={child.id}>
                        {optionButton(
                  values.category === child.slug,
                  () => onChange({ category: child.slug }),
                  child.name,
                  child.product_count,
                  true
                )}
                      </li>
              )}
                  </ul>
            }
              </li>
          )}
          </ul>
        }
      </div>

      {(brandsLoading || brands.length > 0) &&
      <div className="border-t border-line pt-8">
          <h3 className={headingClass}>Brand</h3>
          {brandsLoading ?
        skeleton :

        <ul className="space-y-0.5">
              <li>{optionButton(values.brand === '', () => onChange({ brand: '' }), 'All brands')}</li>
              {brands.map((b) =>
          <li key={b.id}>{optionButton(values.brand === b.slug, () => onChange({ brand: b.slug }), b.name)}</li>
          )}
            </ul>
        }
        </div>
      }

      <form
        className="border-t border-line pt-8"
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ min_price: min, max_price: max });
        }}>
        
        <h3 className={headingClass}>Price (LKR)</h3>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="min-price">
            Minimum price
          </label>
          <input id="min-price" inputMode="numeric" className="field py-2" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} />
          <span className="text-subtle">–</span>
          <label className="sr-only" htmlFor="max-price">
            Maximum price
          </label>
          <input id="max-price" inputMode="numeric" className="field py-2" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} />
        </div>
        <button type="submit" className="btn-secondary mt-3 w-full py-2.5">
          Apply price
        </button>
      </form>

      <div className="border-t border-line pt-8">
      <fieldset className="space-y-3">
        <legend className={headingClass}>Show only</legend>
        <label className="flex cursor-pointer items-center gap-3 text-[15px]">
          <input
              type="checkbox"
              className="h-4 w-4 accent-ink"
              checked={values.is_featured}
              onChange={(e) => onChange({ is_featured: e.target.checked })} />
            
          Featured products
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-[15px]">
          <input
              type="checkbox"
              className="h-4 w-4 accent-ink"
              checked={values.in_stock}
              onChange={(e) => onChange({ in_stock: e.target.checked })} />
            
          In stock
        </label>
      </fieldset>
      </div>

      <button type="button" onClick={onClear} className="text-sm font-medium text-muted underline underline-offset-4 hover:text-ink">
        Clear all filters
      </button>
    </div>);

}