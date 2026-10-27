import React, { useMemo } from 'react';
import type { ProductSpec } from '../../types/api';

export function SpecificationsTable({ specs }: {specs: ProductSpec[];}) {
  const groups = useMemo(() => {
    const map = new Map<string, ProductSpec[]>();
    [...specs].
    sort((a, b) => a.display_order - b.display_order).
    forEach((s) => {
      const key = s.group || 'General';
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [specs]);

  if (specs.length === 0) {
    return <p className="text-muted">Specifications haven’t been published for this product yet.</p>;
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {groups.map(([group, rows]) =>
      <div key={group}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-leaf">{group}</h3>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map((row) =>
          <div key={row.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3 text-[15px]">
                <dt className="text-muted">{row.key}</dt>
                <dd className="text-ink">{row.value}</dd>
              </div>
          )}
          </dl>
        </div>
      )}
    </div>);

}