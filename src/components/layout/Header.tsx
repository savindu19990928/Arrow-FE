import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, MoonIcon, SearchIcon, ShoppingCartIcon, SunIcon, UserIcon, XIcon } from 'lucide-react';
import { Logo } from '../Logo';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  to: string;
  isActive: (path: string) => boolean;
}

export function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const nav: NavItem[] = [
  { label: 'Products', to: '/shop', isActive: (p) => p === '/shop' || p.startsWith('/product/') },
  { label: 'Maintenance', to: '/maintenance', isActive: (p) => p === '/maintenance' },
  { label: 'Our Story', to: '/our-story', isActive: (p) => p === '/our-story' },
  { label: 'Support', to: '/support', isActive: (p) => p === '/support' || p === '/track' }];


  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-site items-center justify-between px-5 md:h-[92px] md:px-10">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {nav.map((item) => {
              const active = item.isActive(location.pathname);
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    className={`focus-ring relative block whitespace-nowrap rounded py-2 text-[15px] ${
                    active ? 'font-medium text-ink' : 'text-ink/80 hover:text-ink'}`
                    }
                    aria-current={active ? 'page' : undefined}>
                    
                    {item.label}
                    {active &&
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 h-[2px] w-full bg-lime-bright"
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} />

                    }
                  </NavLink>
                </li>);

            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring rounded-full p-2.5 hover:bg-ink/10"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            
            {theme === 'dark' ?
            <SunIcon className="h-[22px] w-[22px]" strokeWidth={1.6} /> :

            <MoonIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />
            }
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="focus-ring rounded-full p-2.5 hover:bg-ink/10"
            aria-label="Search products"
            aria-expanded={searchOpen}>
            
            <SearchIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </button>
          <Link
            to={user ? '/account' : '/login'}
            className="focus-ring rounded-full p-2.5 hover:bg-ink/10"
            aria-label={user ? 'Your account' : 'Sign in'}>
            
            <UserIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </Link>
          <Link
            to="/cart"
            className="focus-ring relative rounded-full p-2.5 hover:bg-ink/10"
            aria-label={`Cart, ${count} items`}>
            
            <ShoppingCartIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />
            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-lime-bright px-1 text-[11px] font-semibold text-ink">
              {count}
            </span>
          </Link>
          <button
            type="button"
            className="focus-ring rounded-full p-2.5 hover:bg-ink/10 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}>
            
            {menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {searchOpen &&
        <motion.div
          key="search"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="border-t border-line bg-paper">
          
            <form onSubmit={submitSearch} className="mx-auto flex max-w-site items-center gap-3 px-5 py-4 md:px-10" role="search">
              <SearchIcon className="h-5 w-5 text-subtle" aria-hidden />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
              id="site-search"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              placeholder="Search e-bikes, batteries, parts, accessories…"
              className="flex-1 bg-transparent py-2 text-lg outline-none placeholder:text-subtle" />
            
              <button type="submit" className="btn-primary px-5 py-2.5">
                Search
              </button>
            </form>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {menuOpen &&
        <motion.nav
          key="mobile-nav"
          aria-label="Mobile"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden border-t border-line bg-paper lg:hidden">
          
            <ul className="px-5 py-3">
              {nav.map((item) =>
            <li key={item.label}>
                  <Link to={item.to} className="block border-b border-line py-3.5 text-lg">
                    {item.label}
                  </Link>
                </li>
            )}
              <li>
                <Link to="/track" className="block py-3.5 text-lg">
                  Track an order
                </Link>
              </li>
            </ul>
          </motion.nav>
        }
      </AnimatePresence>
    </header>);

}