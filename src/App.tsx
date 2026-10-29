import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { LOGO_URL } from './data/site';
import { setFavicon } from './utils/favicon';
import { ensureViewportMeta } from './utils/viewport';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { TrackOrder } from './pages/TrackOrder';
import { Account } from './pages/Account';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Maintenance } from './pages/Maintenance';
import { Policy } from './pages/Policy';
import { NotFound } from './pages/NotFound';

interface AppProps {
  showMaintenanceNotice?: boolean;
}

export function App({ showMaintenanceNotice = true }: AppProps) {
  useEffect(() => {
    ensureViewportMeta();
    setFavicon(LOGO_URL);
    document.title = 'Arrow Ventures — Electric Bikes, Parts & Accessories';
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home showMaintenanceNotice={showMaintenanceNotice} />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/policies/:slug" element={<Policy />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster
              theme="dark"
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'rgb(20 20 20)',
                  border: '1px solid rgb(40 40 40)',
                  color: 'rgb(250 250 250)'
                }
              }} />
            
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>);

}