import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { StateMessage } from '../StateMessage';
import { errorMessage } from '../../utils/apiClient';
import { formatDate } from '../../utils/format';
import { notificationApi } from '../../utils/storeApi';
import type { NotificationsResponse } from '../../types/api';

interface NotificationsTabProps {
  data: NotificationsResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: React.Dispatch<React.SetStateAction<NotificationsResponse | null>>;
}

export function NotificationsTab({ data, loading, error, reload, setData }: NotificationsTabProps) {
  const markRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setData((d) =>
      d ?
      {
        unread_count: Math.max(0, d.unread_count - 1),
        notifications: d.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n)
      } :
      d
      );
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (error) return <StateMessage tone="error" title="We couldn’t load notifications" description={error} onRetry={reload} />;
  if (loading && !data) return <div className="h-40 animate-pulse rounded-md bg-white" aria-busy="true" />;
  if (!data || data.notifications.length === 0) {
    return <StateMessage title="You’re all caught up" description="Order, payment and delivery updates will appear here." />;
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-md bg-white">
      {data.notifications.map((n) => {
        const orderNumber = typeof n.data?.order_number === 'string' ? n.data.order_number : null;
        return (
          <li key={n.id} className={`flex gap-4 p-5 ${n.is_read ? '' : 'bg-lime/15'}`}>
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-lime-bright'}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{n.title}</p>
                <span className="text-sm text-muted">{formatDate(n.created_at, 'd MMM yyyy, h:mm a')}</span>
              </div>
              <p className="mt-1 text-[15px] text-muted">{n.message}</p>
              <div className="mt-2 flex gap-4 text-sm">
                {orderNumber &&
                <Link to={`/track?order_number=${orderNumber}`} className="font-medium underline underline-offset-4">
                    View order
                  </Link>
                }
                {!n.is_read &&
                <button type="button" onClick={() => void markRead(n.id)} className="text-muted underline underline-offset-4 hover:text-ink">
                    Mark as read
                  </button>
                }
              </div>
            </div>
          </li>);

      })}
    </ul>);

}