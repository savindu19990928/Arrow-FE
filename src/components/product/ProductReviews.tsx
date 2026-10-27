import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon, StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { RatingStars } from '../RatingStars';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { errorMessage } from '../../utils/apiClient';
import { formatDate } from '../../utils/format';
import { reviewApi } from '../../utils/storeApi';

interface ProductReviewsProps {
  productId: number;
  productSlug: string;
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({ productId, productSlug, averageRating, reviewCount }: ProductReviewsProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(() => reviewApi.list(productSlug, page), [productSlug, page]);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setFormError('Choose a star rating.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await reviewApi.submit({ product: productId, rating, title: title.trim(), review_text: text.trim() });
      toast.success('Thanks — your review has been submitted.');
      setRating(0);
      setTitle('');
      setText('');
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = data?.results ?? [];

  return (
    <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
      <div>
        <p className="display text-7xl">{averageRating ? averageRating.toFixed(1) : '—'}</p>
        <div className="mt-3">
          <RatingStars rating={averageRating} size="md" />
        </div>
        <p className="mt-2 text-sm text-muted">
          Based on {reviewCount} review{reviewCount === 1 ? '' : 's'}
        </p>

        {user ?
        <form onSubmit={submit} className="mt-8 space-y-4 border-t border-line pt-6">
            <h3 className="text-lg font-medium">Write a review</h3>
            <fieldset>
              <legend className="label">Your rating</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) =>
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className="focus-ring rounded p-1"
                aria-label={`${i} star${i > 1 ? 's' : ''}`}
                aria-pressed={rating === i}>
                
                    <StarIcon className={`h-6 w-6 ${i <= rating ? 'fill-ink text-ink' : 'text-ink/30'}`} />
                  </button>
              )}
              </div>
            </fieldset>
            <div>
              <label htmlFor="review-title" className="label">
                Title
              </label>
              <input id="review-title" className="field" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="review-text" className="label">
                Your experience
              </label>
              <textarea
              id="review-text"
              className="field min-h-[110px]"
              required
              value={text}
              onChange={(e) => setText(e.target.value)} />
            
            </div>
            {formError &&
          <p role="alert" className="text-sm text-danger">
                {formError}
              </p>
          }
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form> :

        <p className="mt-8 border-t border-line pt-6 text-[15px] text-muted">
            <Link to="/login" className="font-medium text-ink underline underline-offset-4">
              Sign in
            </Link>{' '}
            to share your experience with this product.
          </p>
        }
      </div>

      <div>
        {loading && !data ?
        <div className="space-y-6" aria-hidden>
            {[0, 1, 2].map((i) =>
          <div key={i} className="space-y-2 border-b border-line pb-6">
                <div className="h-4 w-24 animate-pulse rounded bg-canvas" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-canvas" />
                <div className="h-4 w-full animate-pulse rounded bg-canvas" />
              </div>
          )}
          </div> :
        error ?
        <div role="alert" className="text-muted">
            {error}{' '}
            <button type="button" onClick={reload} className="font-medium text-ink underline underline-offset-4">
              Retry
            </button>
          </div> :
        reviews.length === 0 ?
        <p className="text-muted">No reviews yet. Be the first to ride and review it.</p> :

        <>
            <ul className="divide-y divide-line">
              {reviews.map((r) =>
            <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <RatingStars rating={r.rating} />
                    <span className="text-sm text-muted">{formatDate(r.created_at)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-medium">{r.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{r.review_text}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-ink">
                    {r.user_name}
                    {r.verified_purchase &&
                <span className="inline-flex items-center gap-1 text-leaf">
                        <BadgeCheckIcon className="h-4 w-4" aria-hidden /> Verified purchase
                      </span>
                }
                  </p>
                </li>
            )}
            </ul>
            {(data?.next || data?.previous) &&
          <div className="mt-6 flex gap-3">
                <button type="button" className="btn-secondary" disabled={!data?.previous} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button type="button" className="btn-secondary" disabled={!data?.next} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
          }
          </>
        }
      </div>
    </div>);

}