import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminProtectedRoute from '../components/common/AdminProtectedRoute';
import { AdminThemeProvider } from '../context/AdminThemeContext';
import { AdminDateProvider } from '../context/AdminDateContext';

// Public pages
import Home from '../pages/Home';
import ProductListing from '../pages/ProductListing';
import ProductDetail from '../pages/ProductDetail';
import Portfolio from '../pages/Portfolio';
import Checkout from '../pages/Checkout';
import OrderConfirmation from '../pages/OrderConfirmation';
import Download from '../pages/Download';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';

// User account pages
import Orders from '../pages/Account/Orders';
import Wishlist from '../pages/Account/Wishlist';

import client from '../api/client';

const PageTracker = () => {
  const location = useLocation();
  const lastTrackedRef = React.useRef({ path: '', time: 0 });

  React.useEffect(() => {
    let visitorId = localStorage.getItem('superui_vid');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('superui_vid', visitorId);
    }

    let sessionId = sessionStorage.getItem('superui_sid');
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('superui_sid', sessionId);
    }

    if (location.pathname.startsWith('/india/admin')) return;

    const now = Date.now();
    // Strict deduplication guard against React 18 StrictMode double-mounting (+2 bug)
    if (lastTrackedRef.current.path === location.pathname && (now - lastTrackedRef.current.time < 1500)) {
      return;
    }

    lastTrackedRef.current = { path: location.pathname, time: now };

    client.post('/api/public/analytics/pageview', {
      visitorId,
      sessionId,
      page: location.pathname,
      referrer: document.referrer || ''
    }, { silent: true }).catch(() => {});
  }, [location.pathname]);

  return null;
};

// Admin pages
import AdminLogin from '../pages/admin/AdminLogin';
import MfaVerify from '../pages/admin/MfaVerify';
import MfaEnroll from '../pages/admin/MfaEnroll';
import Dashboard from '../pages/admin/Dashboard';
import CategoriesAdmin from '../pages/admin/Categories';
import HeroImagesAdmin from '../pages/admin/HeroImages';
import UpcomingBannersAdmin from '../pages/admin/UpcomingBanners';
import CustomersAdmin from '../pages/admin/Customers';
import OrdersAdmin from '../pages/admin/Orders';
import PaymentsAdmin from '../pages/admin/Payments';
import BookingsAdmin from '../pages/admin/Bookings';
import DownloadsAdmin from '../pages/admin/Downloads';
import ContactsAdmin from '../pages/admin/Contacts';
import EmailAdmin from '../pages/admin/Email';
import TelegramAdmin from '../pages/admin/Telegram';
import SettingsAdmin from '../pages/admin/Settings';
import NavbarAdmin from '../pages/admin/NavbarAdmin';
import ServicesAdmin from '../pages/admin/Services';
import SecurityAdmin from '../pages/admin/Security';
import ReportsAdmin from '../pages/admin/Reports';
import FeedbackAdmin from '../pages/admin/Feedback';
import IssuesAdmin from '../pages/admin/Issues';
import PricingAdmin from '../pages/admin/Pricing';
import VisitorsAdmin from '../pages/admin/Visitors';
import PagesAdmin from '../pages/admin/Pages';
import TestimonialsAdmin from '../pages/admin/TestimonialsAdmin';
import PageConfigPanel from '../pages/admin/PageConfigPanel';
import Products from '../pages/admin/Products';

// Public Storefront Layout Wrapper
const StorefrontLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#FAFAFA] text-neutral-900">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const AppRouter = () => {
  return (
    <>
      <PageTracker />
      <Routes>
      {/* Public Storefront Routes */}
      <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
      <Route path="/products" element={<StorefrontLayout><ProductListing /></StorefrontLayout>} />
      <Route path="/products/:slug" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
      <Route path="/portfolio" element={<StorefrontLayout><Portfolio /></StorefrontLayout>} />
      <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
      <Route path="/order/confirmation/:id" element={<StorefrontLayout><OrderConfirmation /></StorefrontLayout>} />
      <Route path="/download/:token" element={<StorefrontLayout><Download /></StorefrontLayout>} />
      <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
      <Route path="/services" element={<StorefrontLayout><Services /></StorefrontLayout>} />
      <Route path="/services/:slug" element={<StorefrontLayout><ServiceDetail /></StorefrontLayout>} />
      <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
      
      {/* Protected Customer Routes */}
      <Route path="/account/orders" element={
        <ProtectedRoute>
          <StorefrontLayout>
            <Orders />
          </StorefrontLayout>
        </ProtectedRoute>
      } />
      <Route path="/account/wishlist" element={
        <ProtectedRoute>
          <StorefrontLayout>
            <Wishlist />
          </StorefrontLayout>
        </ProtectedRoute>
      } />

      {/* Admin Panel Routes (No public Navbar/Footer - has custom admin layout) */}
      <Route path="/india/admin/login" element={
        <AdminThemeProvider>
          <AdminLogin />
        </AdminThemeProvider>
      } />
      <Route path="/india/admin/mfa" element={
        <AdminThemeProvider>
          <MfaVerify />
        </AdminThemeProvider>
      } />
      <Route path="/india/admin/mfa-enroll" element={
        <AdminThemeProvider>
          <MfaEnroll />
        </AdminThemeProvider>
      } />
      
      <Route path="/india/admin/dashboard" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <Dashboard />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />
      
      <Route path="/india/admin/categories" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <CategoriesAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/hero-images" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <HeroImagesAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/upcoming-banners" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <UpcomingBannersAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/customers" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <CustomersAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/orders" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <OrdersAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/payments" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <PaymentsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/bookings" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <BookingsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />



      <Route path="/india/admin/downloads" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <DownloadsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/contacts" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <ContactsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/email" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <EmailAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/telegram" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <TelegramAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/settings" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
              <SettingsAdmin />
            </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />
      <Route path="/india/admin/navbar" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
              <NavbarAdmin />
            </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/services" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <ServicesAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/security" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <SecurityAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/reports" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <ReportsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/feedback" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <FeedbackAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/issues" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <IssuesAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/pricing" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <PricingAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/visitors" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <VisitorsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/pages" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <PagesAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/testimonials" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <TestimonialsAdmin />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/page-config" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <PageConfigPanel />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      <Route path="/india/admin/products" element={
        <AdminProtectedRoute>
          <AdminDateProvider>
            <AdminThemeProvider>
            <Products />
          </AdminThemeProvider>
          </AdminDateProvider>
        </AdminProtectedRoute>
      } />

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};

export default AppRouter;

