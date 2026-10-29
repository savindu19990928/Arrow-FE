import React, { useMemo } from 'react';
import type { Specification } from '../../types/api';

export function ProductSpecs({ specifications }: {specifications: Specification[];}) {
  const groups = useMemo(() => {
    const map = new Map<string, Specification[]>();
    [...specifications].
    sort((a, b) => a.display_order - b.display_order).
    forEach((spec) => {
      const key = spec.group || 'General';
      map.set(key, [...(map.get(key) ?? []), spec]);
    });
    return Array.from(map.entries());
  }, [specifications]);

  if (!groups.length) return <p className="text-sm text-muted">No specifications listed for this product.</p>;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {groups.map(([group, specs]) =>
      <div key={group}>
          <h3 className="text-sm font-semibold text-fg">{group}</h3>
          <dl className="mt-3 divide-y divide-line border-t border-line">
            {specs.map((spec) =>
          <div key={spec.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3 text-sm">
                <dt className="text-muted">{spec.key}</dt>
                <dd className="text-fg">{spec.value}</dd>
              </div>
          )}
          </dl>
        </div>
      )}
    </div>);

}