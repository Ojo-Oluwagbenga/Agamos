import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Calendar, ShoppingBag, User, LogOut, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', to: '/account', end: true, icon: User },
    { name: 'My Appointments & QR', to: '/account/bookings', icon: Calendar },
    { name: 'My Orders', to: '/account/orders', icon: ShoppingBag },
    { name: 'Profile Settings', to: '/account/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Greeting */}
        <div className="mb-10 pb-6 border-b border-luxury-border">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Client Sanctuary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal mt-1">
            Welcome, {user?.first_name || 'Client'}
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Manage your bespoke appointments, QR attendance passes, and beauty store orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="bg-luxury-card border border-luxury-border p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-widest font-medium transition-colors ${
                        isActive
                          ? 'bg-luxury-gold text-luxury-black font-semibold shadow-gold-subtle'
                          : 'text-luxury-muted hover:text-luxury-white hover:bg-luxury-offblack'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-widest font-medium text-red-400 hover:bg-red-950/40 transition-colors pt-4 border-t border-luxury-border mt-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Outlet Container */}
          <section className="lg:col-span-9">
            <Outlet />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
