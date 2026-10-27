import React from 'react';
import { Link } from 'react-router-dom';
import { HeartOffIcon, ImageOffIcon } from 'lucide-react';
import { StateMessage } from '../StateMessage';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatLKR } from '../../utils/format';

export function WishlistTab() {
  const { items, loading, error, toggle, refresh } = useWishlist();

  if (error) return <StateMessage tone="error" title="We couldn’t load your wishlist" description={error} onRetry={() => void refresh()} />;
  if (loading && items.length === 0) {
    return <div className="h-40 animate-pulse rounded-md bg-white" aria-busy="true" />;
  }
  if (items.length === 0) {
    return (
      <StateMessage
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it for later."
        action={<Link to="/shop" className="btn-primary">Browse products</Link>} />);


  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ id, product }) =>
      <li key={id} className="flex flex-col rounded-md bg-white p-3">
          <Link to={`/product/${product.slug}`} className="block aspect-[1.2] overflow-hidden rounded-sm bg-canvas">
            {product.primary_image ?
          <img src={product.primary_image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" /> :

          <div className="flex h-full items-center justify-center text-subtle"><ImageOffIcon className="h-6 w-6" aria-hidden /></div>
          }
          </Link>
          <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
            <Link to={`/product/${product.slug}`} className="text-lg font-medium hover:underline">{product.name}</Link>
            <p className="mt-1 text-[15px]">{formatLKR(product.price)}</p>
            <p className={`mt-0.5 text-sm ${product.in_stock ? 'text-leaf' : 'text-danger'}`}>{product.in_stock ? 'In stock' : 'Out of stock'}</p>
            <button type="button" onClick={() => void toggle(product.id)} className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm text-muted hover:text-danger">
              <HeartOffIcon className="h-4 w-4" aria-hidden /> Remove
            </button>
          </div>
        </li>
      )}
    </ul>);

}