import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, HeartIcon, ImageOffIcon } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatLKR } from '../../utils/format';
import type { ProductSummary } from '../../types/api';
interface ProductCardProps {
  product: ProductSummary;
}
export function ProductCard({
  product
}: ProductCardProps) {
  const {
    has,
    toggle
  } = useWishlist();
  const saved = has(product.id);
  const hasDiscount = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
  return <article className="group relative flex h-full flex-col rounded-md bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="relative aspect-[1.08] overflow-hidden rounded-sm bg-canvas">
        {product.primary_image ? <img src={product.primary_image} alt={product.name} loading="lazy" className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-subtle">
            <ImageOffIcon className="h-8 w-8" aria-hidden />
          </div>}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.has_3d_model && <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              <div className="h-3 w-3" aria-hidden /> 3D view
            </span>}
          {!product.in_stock && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Out of stock
            </span>}
        </div>
        <button type="button" onClick={() => toggle(product.id)} className="focus-ring absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 hover:bg-white" aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={saved}>
          <HeartIcon className={`h-4 w-4 ${saved ? 'fill-ink text-ink' : 'text-ink'}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-3 pt-5">
        <h3 className="text-xl font-medium leading-snug text-ink">
          <Link to={`/product/${product.slug}`} className="focus-ring rounded after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {product.short_description && <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted">{product.short_description}</p>}
        <div className="mt-auto pt-5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-medium text-ink">{formatLKR(product.price)}</span>
            {hasDiscount && <span className="text-sm text-subtle line-through">{formatLKR(product.compare_at_price)}</span>}
          </div>
          <span className="mt-4 inline-flex items-center gap-2 border-b-2 border-lime-bright pb-1 text-sm font-medium text-leaf">
            Explore <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>;
}