import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts & Nav
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { CartDrawer } from './components/shop/CartDrawer';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { BookingPage } from './pages/public/BookingPage';
import { BookingConfirmationPage } from './pages/public/BookingConfirmationPage';
import { ShopPage } from './pages/public/ShopPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { OrderConfirmationPage } from './pages/public/OrderConfirmationPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { FaqPage } from './pages/public/FaqPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { MockPaystackPage } from './pages/public/MockPaystackPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Customer Sanctuary Pages
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminScannerPage } from './pages/admin/AdminScannerPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminAvailabilityPage } from './pages/admin/AdminAvailabilityPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Public Root Layout Wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-luxury-black text-luxury-white flex flex-col justify-between selection:bg-luxury-gold selection:text-luxury-black">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Website Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:slug" element={<ServiceDetailPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/booking/:id" element={<BookingConfirmationPage />} />
                <Route path="/booking/verify" element={<BookingConfirmationPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/:id" element={<OrderConfirmationPage />} />
                <Route path="/order/verify" element={<OrderConfirmationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Route>

              {/* Mock Paystack Simulator */}
              <Route path="/mock-paystack" element={<MockPaystackPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Customer Sanctuary Portal */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CustomerDashboardPage />} />
                <Route path="bookings" element={<MyBookingsPage />} />
                <Route path="orders" element={<MyOrdersPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Administrator Portal */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="scanner" element={<AdminScannerPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="availability" element={<AdminAvailabilityPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<PublicLayout />}>
                <Route
                  path="*"
                  element={
                    <div className="pt-36 pb-24 text-center px-4">
                      <h1 className="font-serif text-5xl mb-3">404</h1>
                      <p className="text-xs uppercase tracking-widest text-luxury-muted">
                        Sanctuary page not found
                      </p>
                    </div>
                  }
                />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
