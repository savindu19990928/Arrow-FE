import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { errorMessage, toList } from '../utils/apiClient';
import { catalogApi } from '../utils/storeApi';
import type { Brand, Category } from '../types/api';

interface CatalogContextValue {
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  brandsLoading: boolean;
  error: string | null;
  bikeCategory: Category | null;
  accessoriesCategory: Category | null;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: {children: React.ReactNode;}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.
    categories().
    then((res) =>
    setCategories(
      toList(res).
      filter((c) => c.is_active !== false).
      sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    )
    ).
    catch((err: unknown) => setError(errorMessage(err))).
    finally(() => setLoading(false));

    // There is no dedicated brands endpoint, so derive the list from the catalogue.
    catalogApi.
    products({ page_size: 100 }).
    then((res) => {
      const map = new Map<string, Brand>();
      res.results.forEach((p) => {
        if (p.brand && !map.has(p.brand.slug)) map.set(p.brand.slug, p.brand);
      });
      setBrands([...map.values()].sort((a, b) => a.name.localeCompare(b.name)));
    }).
    catch(() => setBrands([])).
    finally(() => setBrandsLoading(false));
  }, []);

  const value = useMemo(() => {
    const roots = categories.filter((c) => !c.parent);
    const find = (pattern: RegExp) =>
    roots.find((c) => pattern.test(c.name) || pattern.test(c.slug)) ??
    categories.find((c) => pattern.test(c.name) || pattern.test(c.slug)) ??
    null;
    return {
      categories,
      brands,
      loading,
      brandsLoading,
      error,
      bikeCategory: find(/bike|bicycle/i),
      accessoriesCategory: find(/accessor/i)
    };
  }, [categories, brands, loading, brandsLoading, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}