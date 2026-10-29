import React from 'react';
import { toast } from 'sonner';
import { BellIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getErrorMessage } from '../../utils/apiClient';
import { formatDate } from '../../utils/format';
import { notificationApi } from '../../utils/shopApi';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';

export function NotificationsTab() {
  const list = useApi(() => notificationApi.list(), []);

  const markRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      if (list.data) {
        list.setData({
          unread_count: Math.max(0, list.data.unread_count - 1),
          notifications: list.data.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n)
        });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (list.loading) return <Spinner label="Loading notifications" />;
  if (list.error) return <ErrorState message={list.error} onRetry={list.reload} />;
  const notifications = list.data?.notifications ?? [];
  if (!notifications.length) {
    return <EmptyState icon={BellIcon} title="No notifications" message="Order and payment updates will show up here." />;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{list.data?.unread_count ?? 0} unread</p>
      <ul className="divide-y divide-line border-y border-line">
        {notifications.map((n) =>
        <li key={n.id} className="flex gap-4 py-5">
            <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-fg'}`}
            aria-label={n.is_read ? undefined : 'Unread'} />
          
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={`text-sm ${n.is_read ? 'text-muted' : 'font-medium text-fg'}`}>{n.title}</p>
                <span className="text-xs text-subtle">{formatDate(n.created_at, true)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{n.message}</p>
              {!n.is_read &&
            <button type="button" onClick={() => void markRead(n.id)} className="mt-2 text-xs text-fg underline-offset-2 hover:underline">
                  Mark as read
                </button>
            }
            </div>
          </li>
        )}
      </ul>
    </div>);

}