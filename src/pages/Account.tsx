import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { BellIcon, HeartIcon, LogOutIcon, MapPinIcon, PackageIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AddressesTab } from '../components/account/AddressesTab';
import { NotificationsTab } from '../components/account/NotificationsTab';
import { OrdersTab } from '../components/account/OrdersTab';
import { ProfileTab } from '../components/account/ProfileTab';
import { WishlistTab } from '../components/account/WishlistTab';
import { Spinner } from '../components/ui/Spinner';

const tabs = [
{ id: 'orders', label: 'Orders', icon: PackageIcon },
{ id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
{ id: 'addresses', label: 'Addresses', icon: MapPinIcon },
{ id: 'notifications', label: 'Notifications', icon: BellIcon },
{ id: 'profile', label: 'Profile', icon: UserIcon }] as
const;

type TabId = (typeof tabs)[number]['id'];

export function Account() {
  const { user, initializing, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const active = (tabs.find((t) => t.id === params.get('tab'))?.id ?? 'orders') as TabId;

  if (initializing) return <Spinner label="Loading your account" />;
  if (!user) return <Navigate to="/login" replace state={{ from: `/account${params.toString() ? `?${params}` : ''}` }} />;

  return (
    <div className="w-full bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <p className="truncate text-sm text-muted">Signed in as {user.email}</p>
        <h1 className="mt-1 break-words font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">
          Hi, {user.first_name || 'there'}
        </h1>

        <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-[220px_1fr] lg:gap-10">
          <nav
            aria-label="Account sections"
            className="scrollbar-none -mx-4 overflow-x-auto border-b border-line px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:self-start lg:border-b-0 lg:px-0 lg:sticky lg:top-24">
            
            <ul className="flex gap-1 pb-2 lg:flex-col lg:pb-0">
              {tabs.map((tab) =>
              <li key={tab.id}>
                  <button
                  type="button"
                  onClick={() => setParams({ tab: tab.id })}
                  aria-current={active === tab.id ? 'page' : undefined}
                  className={`flex min-h-[2.75rem] w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors lg:min-h-[2.5rem] lg:gap-3 duration-150 ${
                  active === tab.id ? 'bg-raised text-fg' : 'text-muted hover:text-fg'}`
                  }>
                  
                    <tab.icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                </li>
              )}
              <li className="lg:mt-4 lg:border-t lg:border-line lg:pt-4">
                <button
                  type="button"
                  onClick={logout}
                  className="flex min-h-[2.75rem] w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 text-sm text-muted lg:min-h-[2.5rem] lg:gap-3 transition-colors duration-150 hover:text-fg">
                  
                  <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>

          <section className="min-w-0" aria-label={tabs.find((t) => t.id === active)?.label}>
            {active === 'orders' && <OrdersTab />}
            {active === 'wishlist' && <WishlistTab />}
            {active === 'addresses' && <AddressesTab />}
            {active === 'notifications' && <NotificationsTab />}
            {active === 'profile' && <ProfileTab />}
          </section>
        </div>
      </div>
    </div>);

}