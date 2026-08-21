import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Menu, X, Calendar, Sparkles, Shield } from 'lucide-react';
import { AgamosLogo } from '../brand/AgamosLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { ThemeSelector } from '../ui/ThemeSelector';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Book a Session', href: '/book' },
    { name: 'Shop Beauty', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border/60 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-luxury-black/90 via-luxury-black/60 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Brand Logo */}
            <div className="flex-shrink-0">
              <AgamosLogo variant="primary" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`font-sans text-xs uppercase tracking-widest-luxury font-medium transition-colors duration-200 relative py-1 ${
                      isActive ? 'text-luxury-gold' : 'text-luxury-white/90 hover:text-luxury-gold'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & CTAs */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Luxury Atmosphere / Theme Selector */}
              <ThemeSelector />

              {/* Admin Portal Shortcut if user is staff/admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 border border-luxury-gold/50 bg-luxury-card text-luxury-gold text-[10px] uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </Link>
              )}

              {/* Account Link */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="p-2 text-luxury-white/90 hover:text-luxury-gold transition-colors"
                title={isAuthenticated ? `Account (${user?.first_name})` : 'Sign In'}
              >
                <UserIcon className="w-5 h-5" />
              </Link>

              {/* Shopping Bag Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-luxury-white/90 hover:text-luxury-gold transition-colors relative"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-luxury-gold text-luxury-black text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Primary Header CTA */}
              <Link to="/book" className="hidden sm:inline-block">
                <Button variant="gold" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                  Book Session
                </Button>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-luxury-white hover:text-luxury-gold transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-luxury-black/98 backdrop-blur-lg pt-24 px-6 pb-12 flex flex-col justify-between overflow-y-auto animate-fade-in md:hidden">
          <div className="space-y-6 text-center">
            <div className="pb-4 border-b border-luxury-border">
              <AgamosLogo variant="stacked" linkToHome={false} />
            </div>

            <nav className="flex flex-col space-y-5 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="font-serif text-xl font-medium tracking-wider text-luxury-white hover:text-luxury-gold transition-colors py-1"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  className="font-serif text-xl font-medium tracking-wider text-luxury-gold py-1"
                >
                  My Client Portal
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="font-serif text-xl font-medium tracking-wider text-luxury-white/80 py-1"
                >
                  Sign In / Register
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="font-serif text-xl font-medium tracking-wider text-luxury-gold border border-luxury-gold/40 py-2 mt-2"
                >
                  Administrator Portal
                </Link>
              )}
            </nav>
          </div>

          <div className="space-y-3 pt-8 border-t border-luxury-border">
            <Link to="/book" className="block w-full">
              <Button variant="gold" size="lg" className="w-full">
                Book An Appointment
              </Button>
            </Link>
            <p className="text-center text-[10px] uppercase tracking-widest text-luxury-muted">
              12A Victoria Island Luxury Blvd, Lagos
            </p>
          </div>
        </div>
      )}
    </>
  );
};
