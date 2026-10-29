import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { BadgeCheckIcon, MessageSquareIcon, StarIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getErrorMessage } from '../../utils/apiClient';
import { formatDate } from '../../utils/format';
import { reviewApi } from '../../utils/shopApi';
import { Button } from '../ui/Button';
import { ErrorState } from '../ui/ErrorState';
import { Rating } from '../ui/Rating';
import { Spinner } from '../ui/Spinner';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import type { ProductDetail } from '../../types/api';

export function ReviewsSection({ product }: {product: ProductDetail;}) {
  const { user } = useAuth();
  const location = useLocation();
  const reviews = useApi(() => reviewApi.list(product.slug), [product.slug]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating.');
      return;
    }
    setSubmitting(true);
    try {
      const review = await reviewApi.submit({ product: product.id, rating, title, review_text: text });
      reviews.setData([review, ...(reviews.data ?? [])]);
      toast.success('Thanks! Your review has been submitted.');
      setShowForm(false);
      setRating(0);
      setTitle('');
      setText('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="font-display text-5xl font-extrabold tabular-nums text-fg">
          {Number(product.average_rating ?? 0).toFixed(1)}
        </p>
        <div className="mt-2">
          <Rating value={product.average_rating} count={product.review_count} size="md" />
        </div>
        <div className="mt-6">
          {user ?
          !showForm &&
          <Button variant="secondary" onClick={() => setShowForm(true)}>
                Write a review
              </Button> :


          <p className="text-sm text-muted">
              <Link to="/login" state={{ from: location.pathname }} className="text-fg underline underline-offset-2">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          }
        </div>
      </div>

      <div>
        {showForm &&
        <form onSubmit={submit} className="mb-10 space-y-4 rounded-lg border border-line bg-surface p-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fg">Your rating</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) =>
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={rating === n}
                className="p-1">
                
                    <StarIcon className={`h-6 w-6 ${n <= rating ? 'fill-fg text-fg' : 'text-subtle'}`} />
                  </button>
              )}
              </div>
            </fieldset>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
            <TextAreaField label="Review" value={text} onChange={(e) => setText(e.target.value)} required />
            <div className="flex gap-2">
              <Button type="submit" loading={submitting}>
                Submit review
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        }

        {reviews.loading ?
        <Spinner label="Loading reviews" /> :
        reviews.error ?
        <ErrorState compact message={reviews.error} onRetry={reviews.reload} /> :
        !reviews.data?.length ?
        <div className="flex items-center gap-3 border-t border-line py-8 text-sm text-muted">
            <MessageSquareIcon className="h-5 w-5" aria-hidden="true" />
            No reviews yet. Be the first to share your experience.
          </div> :

        <ul className="divide-y divide-line border-t border-line">
            {reviews.data.map((review) =>
          <li key={review.id} className="py-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Rating value={review.rating} />
                  <span className="text-sm font-medium text-fg">{review.user_name}</span>
                  {review.verified_purchase &&
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <BadgeCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified purchase
                    </span>
              }
                  <span className="text-xs text-subtle">{formatDate(review.created_at)}</span>
                </div>
                {review.title && <h4 className="mt-3 font-medium text-fg">{review.title}</h4>}
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{review.review_text}</p>
              </li>
          )}
          </ul>
        }
      </div>
    </div>);

}