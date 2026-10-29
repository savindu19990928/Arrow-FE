import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ImageOffIcon } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatLKR } from '../../utils/format';
import { buttonClasses } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';

export function WishlistTab() {
  const { items, loading, error, refresh, toggle, pendingId } = useWishlist();

  if (loading && !items.length) return <Spinner label="Loading wishlist" />;
  if (error && !items.length) return <ErrorState message={error} onRetry={() => void refresh()} />;
  if (!items.length) {
    return (
      <EmptyState
        icon={HeartIcon}
        title="Your wishlist is empty"
        message="Tap the heart on any product to save it for later."
        action={
        <Link to="/catalog" className={buttonClasses('primary')}>
            Browse the catalog
          </Link>
        } />);


  }

  return (
    <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ id, product }) =>
      <li key={id} className="flex flex-col">
          <Link to={`/product/${product.slug}`} className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
            {product.primary_image ?
          <img src={product.primary_image} alt={product.name} className="h-full w-full object-cover" /> :

          <span className="flex h-full items-center justify-center text-subtle">
                <ImageOffIcon className="h-6 w-6" aria-hidden="true" />
              </span>
          }
          </Link>
          <Link to={`/product/${product.slug}`} className="mt-3 font-medium text-fg hover:underline">
            {product.name}
          </Link>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-sm tabular-nums text-fg">
              {formatLKR(product.price)}
              {!product.in_stock && <span className="ml-2 text-xs text-subtle">Out of stock</span>}
            </span>
            <button
            type="button"
            onClick={() => void toggle(product.id)}
            disabled={pendingId === product.id}
            className="text-sm text-muted hover:text-fg disabled:opacity-50">
            
              Remove
            </button>
          </div>
        </li>
      )}
    </ul>);

}