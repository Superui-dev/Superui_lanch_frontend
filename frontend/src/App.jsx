import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WatchlistProvider } from './context/WatchlistContext';
import AppRouter from './routes/AppRouter';
import OrderPurchaseNotifier from './components/common/OrderPurchaseNotifier';
import ScrollToTop from './components/common/ScrollToTop';
import BookingCallModal from './components/common/BookingCallModal';

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
                <BookingCallModalWrapper />
                <OrderPurchaseNotifier />
              </WatchlistProvider>
            </CartProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function BookingCallModalWrapper() {
  const { isBookModalOpen, closeBookingModal, bookModalServiceName } = useAuth();
  return <BookingCallModal isOpen={isBookModalOpen} onClose={closeBookingModal} serviceName={bookModalServiceName} />;
}

export default App;
