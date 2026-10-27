import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';
import { OrdersTab } from '../components/account/OrdersTab';
import { WishlistTab } from '../components/account/WishlistTab';
import { AddressesTab } from '../components/account/AddressesTab';
import { ProfileTab } from '../components/account/ProfileTab';
import { NotificationsTab } from '../components/account/NotificationsTab';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { notificationApi } from '../utils/storeApi';

const tabs = [
{ id: 'orders', label: 'Orders' },
{ id: 'wishlist', label: 'Wishlist' },
{ id: 'notifications', label: 'Notifications' },
{ id: 'addresses', label: 'Addresses' },
{ id: 'profile', label: 'Profile' }] as
const;

type TabId = (typeof tabs)[number]['id'];

export function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const active = (tabs.find((t) => t.id === params.get('tab'))?.id ?? 'orders') as TabId;
  const notifications = useApi(() => notificationApi.list(), []);
  const unread = notifications.data?.unread_count ?? 0;

  return (
    <div className="min-h-[70vh] bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-10 md:px-10 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">My account</p>
            <h1 className="display mt-3 text-[44px] md:text-[64px]">Hi, {user?.first_name || 'rider'}</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn-secondary">
            
            <LogOutIcon className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>

        <div role="tablist" aria-label="Account sections" className="mt-10 flex gap-6 overflow-x-auto border-b border-line">
          {tabs.map((t) =>
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => setParams({ tab: t.id })}
            className={`focus-ring -mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-[15px] ${
            active === t.id ? 'border-lime-bright font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`
            }>
            
              {t.label}
              {t.id === 'notifications' && unread > 0 &&
            <span className="rounded-full bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">{unread}</span>
            }
            </button>
          )}
        </div>

        <div className="mt-8" role="tabpanel">
          {active === 'orders' && <OrdersTab />}
          {active === 'wishlist' && <WishlistTab />}
          {active === 'notifications' && <NotificationsTab {...notifications} />}
          {active === 'addresses' && <AddressesTab />}
          {active === 'profile' && <ProfileTab />}
        </div>
      </div>
    </div>);

}