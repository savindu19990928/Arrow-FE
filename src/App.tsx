import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemedToaster } from './components/ThemedToaster';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CatalogProvider } from './contexts/CatalogContext';
import { SiteLayout } from './components/layout/SiteLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { LOGO_URL } from './components/Logo';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { TrackOrder } from './pages/TrackOrder';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { AccountOrderDetail } from './pages/AccountOrderDetail';
import { OurStory } from './pages/OurStory';
import { Support } from './pages/Support';
import { Maintenance } from './pages/Maintenance';
import { Policy } from './pages/Policy';
import { NotFound } from './pages/NotFound';

export function App() {
  useEffect(() => {
    document.title = 'Arrow Ventures · Electric Bikes, Parts & Accessories';
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/jpeg';
    link.href = LOGO_URL;
  }, []);

  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route element={<SiteLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:slug" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order/:orderNumber" element={<OrderConfirmation />} />
                  <Route path="track" element={<TrackOrder />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="our-story" element={<OurStory />} />
                  <Route path="support" element={<Support />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="policies" element={<Navigate to="/policies/refund" replace />} />
                  <Route path="policies/:slug" element={<Policy />} />
                  <Route element={<RequireAuth />}>
                    <Route path="account" element={<Account />} />
                    <Route path="account/orders/:id" element={<AccountOrderDetail />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <ThemedToaster />
            </WishlistProvider>
          </CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>);

}