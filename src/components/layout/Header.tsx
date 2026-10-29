import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { mainNav } from '../../data/site';
import { BrandMark } from './BrandMark';

type PanelMode = 'menu' | 'search' | null;

export function Header() {
  const { user } = useAuth();
  const { count } = useCart();
  const { items: wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelMode>(null);
  const [query, setQuery] = useState('');
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setPanel(null), [location.pathname, location.search]);

  useEffect(() => {
    if (panel === 'search') mobileSearchRef.current?.focus();
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/catalog?search=${encodeURIComponent(q)}` : '/catalog');
    setQuery('');
    setPanel(null);
  };

  const toggle = (mode: Exclude<PanelMode, null>) => setPanel((current) => current === mode ? null : mode);

  const iconLink =
  'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/60';

  const mobileLinks = [...mainNav, ...(user ? [{ to: '/account?tab=wishlist', label: 'Wishlist' }] : [])];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 min-[400px]:px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Arrow Ventures home" className="min-w-0 shrink">
          <BrandMark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
            isActive ? 'text-fg' : 'text-muted hover:text-fg'}`

            }>
            
              {item.label}
            </NavLink>
          )}
        </nav>

        <form onSubmit={submitSearch} role="search" className="ml-auto hidden w-full max-w-xs lg:block">
          <label htmlFor="header-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="header-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bikes, parts, accessories"
              className="h-10 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-subtle focus:border-fg/50 focus:outline-none" />
            
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-1 lg:ml-0">
          <button
            type="button"
            className={`${iconLink} lg:hidden`}
            onClick={() => toggle('search')}
            aria-expanded={panel === 'search'}
            aria-controls="mobile-panel"
            aria-label="Search products">
            
            <SearchIcon className="h-5 w-5" />
          </button>
          {user &&
          <Link to="/account?tab=wishlist" className={`${iconLink} hidden sm:flex`} aria-label="Wishlist">
              <HeartIcon className="h-5 w-5" />
              {wishlist.length > 0 &&
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-fg" aria-hidden="true" />
            }
            </Link>
          }
          <Link to={user ? '/account' : '/login'} className={iconLink} aria-label={user ? 'My account' : 'Sign in'}>
            <UserIcon className="h-5 w-5" />
          </Link>
          <Link to="/cart" className={iconLink} aria-label={`Cart, ${count} items`}>
            <ShoppingBagIcon className="h-5 w-5" />
            {count > 0 &&
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-fg px-1 text-[11px] font-semibold text-bg">
                {count > 99 ? '99+' : count}
              </span>
            }
          </Link>
          <button
            type="button"
            className={`${iconLink} md:hidden`}
            onClick={() => toggle('menu')}
            aria-expanded={panel === 'menu'}
            aria-controls="mobile-panel"
            aria-label={panel === 'menu' ? 'Close menu' : 'Open menu'}>
            
            {panel === 'menu' ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {panel &&
        <motion.div
          id="mobile-panel"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-line bg-bg lg:hidden">
          
            <form onSubmit={submitSearch} role="search" className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <input
                ref={mobileSearchRef}
                id="mobile-search"
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bikes, parts, accessories"
                className="h-12 w-full rounded-md border border-line bg-surface pl-10 pr-3.5 text-base text-fg placeholder:text-subtle focus:border-fg/50 focus:outline-none" />
              
              </div>
            </form>
            {panel === 'menu' &&
          <nav aria-label="Mobile" className="flex flex-col border-t border-line px-2 py-2 md:hidden">
                {mobileLinks.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
              `flex min-h-[3rem] items-center rounded-md px-3 text-base transition-colors duration-150 hover:bg-raised ${
              isActive ? 'text-fg' : 'text-muted'}`

              }>
              
                    {item.label}
                  </NavLink>
            )}
              </nav>
          }
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}