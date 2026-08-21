import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  Sparkles,
  Clock,
  Package,
  Boxes,
  ShoppingBag,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { AgamosLogo } from '../brand/AgamosLogo';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', to: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Appointments & Calendar', to: '/admin/bookings', icon: Calendar },
    { name: 'Camera QR Scanner', to: '/admin/scanner', icon: QrCode, highlight: true },
    { name: 'Services & Treatments', to: '/admin/services', icon: Sparkles },
    { name: 'Availability & Schedule', to: '/admin/availability', icon: Clock },
    { name: 'Products Catalog', to: '/admin/products', icon: Package },
    { name: 'Inventory & Stock Ledger', to: '/admin/inventory', icon: Boxes },
    { name: 'Orders & Fulfillment', to: '/admin/orders', icon: ShoppingBag },
    { name: 'CMS & Site Settings', to: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-white flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-luxury-offblack border-r border-luxury-border flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-luxury-border flex items-center justify-between">
            <AgamosLogo variant="primary" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-luxury-muted hover:text-luxury-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Tag */}
          <div className="px-6 py-3 bg-luxury-card/60 border-b border-luxury-border/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-luxury-gold">
                Administrator Suite
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-widest font-medium transition-all ${
                      isActive
                        ? 'bg-luxury-gold text-luxury-black font-semibold shadow-gold-subtle'
                        : item.highlight
                        ? 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                        : 'text-luxury-muted hover:text-luxury-white hover:bg-luxury-card'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-luxury-border bg-luxury-card/40 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 text-xs text-luxury-muted hover:text-luxury-white transition-colors"
          >
            <span className="uppercase tracking-widest text-[10px]">Open Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs uppercase tracking-widest font-medium text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-luxury-offblack border-b border-luxury-border p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-luxury-muted hover:text-luxury-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <AgamosLogo variant="wordmark" />
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
