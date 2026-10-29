import React from 'react';
import { Link } from 'react-router-dom';
import { BoxIcon, HeartIcon, ImageOffIcon } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { formatLKR, toNumber } from '../utils/format';
import { Rating } from './ui/Rating';
import type { ProductSummary } from '../types/api';

export function ProductCard({ product }: {product: ProductSummary;}) {
  const { isSaved, toggle, pendingId } = useWishlist();
  const saved = isSaved(product.id);
  const compareAt = toNumber(product.compare_at_price);
  const price = toNumber(product.price);
  const discount =
  product.discount_percentage && product.discount_percentage > 0 ?
  Math.round(product.discount_percentage) :
  compareAt > price ?
  Math.round((compareAt - price) / compareAt * 100) :
  0;

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-1 flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-4 focus-visible:ring-offset-bg">
        
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
          {product.primary_image ?
          <img
            src={product.primary_image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" /> :


          <div className="flex h-full items-center justify-center text-subtle">
              <ImageOffIcon className="h-8 w-8" aria-hidden="true" />
            </div>
          }
          <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3">
            {product.has_3d_model &&
            <span className="inline-flex items-center gap-1 rounded bg-fg px-1.5 py-0.5 text-[11px] font-semibold text-bg">
                <BoxIcon className="h-3 w-3" aria-hidden="true" />
                3D
              </span>
            }
            {discount > 0 &&
            <span className="rounded border border-fg/30 bg-bg/80 px-1.5 py-0.5 text-[11px] font-semibold text-fg">
                −{discount}%
              </span>
            }
          </div>
          {!product.in_stock &&
          <div className="absolute inset-x-0 bottom-0 bg-bg/85 py-2 text-center text-xs font-medium text-muted">
              Out of stock
            </div>
          }
        </div>
        <div className="mt-3 flex flex-1 flex-col sm:mt-4">
          <p className="truncate text-xs text-subtle">{product.brand?.name ?? product.category?.name ?? '\u00a0'}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-fg sm:text-[15px]">{product.name}</h3>
          <div className="mt-auto pt-2.5 sm:pt-3">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold tabular-nums text-fg sm:text-[15px]">{formatLKR(product.price)}</span>
              {compareAt > price &&
              <span className="text-xs tabular-nums text-subtle line-through">{formatLKR(compareAt)}</span>
              }
            </div>
            <div className="mt-1.5">
              <Rating value={product.average_rating} count={product.review_count} />
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => void toggle(product.id)}
        disabled={pendingId === product.id}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg/80 text-fg transition-[background-color,transform] duration-150 ease-out hover:bg-bg active:scale-90 disabled:opacity-50">
        
        <HeartIcon className={`h-4 w-4 ${saved ? 'fill-fg' : ''}`} aria-hidden="true" />
      </button>
    </article>);

}