import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import type { Brand, Category } from '../../types/api';

export interface CatalogFilterValues {
  category: string;
  brand: string;
  featured: boolean;
  inStock: boolean;
  has3d: boolean;
  minPrice: string;
  maxPrice: string;
}

interface CatalogFiltersProps {
  values: CatalogFilterValues;
  categories: Category[];
  brands: Brand[];
  loadingOptions: boolean;
  onChange: (patch: Record<string, string | null>) => void;
}

export function CatalogFilters({ values, categories, brands, loadingOptions, onChange }: CatalogFiltersProps) {
  const [minPrice, setMinPrice] = useState(values.minPrice);
  const [maxPrice, setMaxPrice] = useState(values.maxPrice);

  useEffect(() => {
    setMinPrice(values.minPrice);
    setMaxPrice(values.maxPrice);
  }, [values.minPrice, values.maxPrice]);

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ min_price: minPrice || null, max_price: maxPrice || null });
  };

  return (
    <div className="space-y-8">
      <FilterGroup title="Show">
        <Check
          label="Featured products"
          checked={values.featured}
          onChange={(v) => onChange({ featured: v ? 'true' : null })} />
        
        <Check label="In stock only" checked={values.inStock} onChange={(v) => onChange({ in_stock: v ? 'true' : null })} />
        <Check label="3D view available" checked={values.has3d} onChange={(v) => onChange({ has_3d: v ? 'true' : null })} />
      </FilterGroup>

      <FilterGroup title="Category">
        {loadingOptions && !categories.length ?
        <OptionSkeleton /> :

        <>
            <Radio name="category" label="All categories" checked={!values.category} onChange={() => onChange({ category: null })} />
            {categories.map((cat) =>
          <Radio
            key={cat.slug}
            name="category"
            label={cat.name}
            count={cat.product_count}
            checked={values.category === cat.slug}
            onChange={() => onChange({ category: cat.slug })} />

          )}
          </>
        }
      </FilterGroup>

      <FilterGroup title="Brand">
        {loadingOptions && !brands.length ?
        <OptionSkeleton /> :

        <>
            <Radio name="brand" label="All brands" checked={!values.brand} onChange={() => onChange({ brand: null })} />
            {brands.map((brand) =>
          <Radio
            key={brand.slug}
            name="brand"
            label={brand.name}
            count={brand.product_count}
            checked={values.brand === brand.slug}
            onChange={() => onChange({ brand: brand.slug })} />

          )}
          </>
        }
      </FilterGroup>

      <FilterGroup title="Price (LKR)">
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="min-price">
              Minimum price
            </label>
            <input
              id="min-price"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-subtle focus:border-fg/50 focus:outline-none" />
            
            <span className="text-subtle" aria-hidden="true">
              –
            </span>
            <label className="sr-only" htmlFor="max-price">
              Maximum price
            </label>
            <input
              id="max-price"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-subtle focus:border-fg/50 focus:outline-none" />
            
          </div>
          <Button type="submit" variant="secondary" size="sm" fullWidth>
            Apply price
          </Button>
        </form>
      </FilterGroup>
    </div>);

}

function FilterGroup({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-fg">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>);

}

function Check({ label, checked, onChange }: {label: string;checked: boolean;onChange: (v: boolean) => void;}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded py-1.5 text-sm text-muted hover:text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-line accent-white" />
      
      <span className={checked ? 'text-fg' : ''}>{label}</span>
    </label>);

}

function Radio({
  name,
  label,
  count,
  checked,
  onChange






}: {name: string;label: string;count?: number;checked: boolean;onChange: () => void;}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded py-1.5 text-sm text-muted hover:text-fg">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 cursor-pointer accent-white" />
      <span className={`flex-1 truncate ${checked ? 'text-fg' : ''}`}>{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-subtle">{count}</span>}
    </label>);

}

function OptionSkeleton() {
  return (
    <div className="space-y-2.5 py-1" aria-hidden="true">
      {[70, 55, 80].map((w) =>
      <div key={w} className="h-4 animate-pulse rounded bg-surface" style={{ width: `${w}%` }} />
      )}
    </div>);

}