import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WatchlistProvider } from './context/WatchlistContext';
import AppRouter from './routes/AppRouter';
import OrderPurchaseNotifier from './components/common/OrderPurchaseNotifier';
import ScrollToTop from './components/common/ScrollToTop';

import ErrorBoundary from './components/common/ErrorBoundary';

import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <SiteSettingsProvider>
          <AuthProvider>
            <CartProvider>
              <WatchlistProvider>
                <AppRouter />
                <OrderPurchaseNotifier />
              </WatchlistProvider>
            </CartProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
