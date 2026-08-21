import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { AgamosLogo } from '../brand/AgamosLogo';
import { Button } from '../ui/Button';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-offblack text-luxury-white border-t border-luxury-border">
      {/* Newsletter & Brand Statement Strip */}
      <div className="border-b border-luxury-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
                The Inner Sanctuary
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug">
                Receive private invitations, seasonal treatment previews & beauty dispatches.
              </h3>
            </div>
            <div className="lg:col-span-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for subscribing to AGAMOS Gazette.');
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  required
                  className="bg-luxury-card border border-luxury-border px-5 py-3.5 text-sm text-luxury-white placeholder-luxury-darkmuted focus:border-luxury-gold outline-none flex-1"
                />
                <Button type="submit" variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Subscribe
                </Button>
              </form>
              <p className="text-[11px] text-luxury-muted mt-2">
                By subscribing you agree to our Privacy Policy. Dispatches are sent discreetly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <AgamosLogo variant="stacked" />
            <p className="text-xs text-luxury-muted max-w-sm leading-relaxed text-center sm:text-left pt-2">
              AGAMOS is an international standard beauty house combining haute coiffure, transformative botanical spa rituals, and curated luxury cosmetic formulations.
            </p>
            <div className="flex items-center space-x-4 pt-2 justify-center sm:justify-start">
              <a
                href="https://instagram.com/agamosluxury"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com/agamosluxury"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                title="Facebook"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="mailto:concierge@agamos.com"
                className="w-9 h-9 border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                title="Email Concierge"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest-luxury font-semibold text-luxury-gold">
              Sanctuary
            </h4>
            <ul className="space-y-2.5 text-xs text-luxury-muted">
              <li>
                <Link to="/services" className="hover:text-luxury-white transition-colors">
                  Haute Hair Artistry
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-luxury-white transition-colors">
                  Spa & Wellness Rituals
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-luxury-white transition-colors">
                  Nail Couture
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-luxury-white transition-colors">
                  Red Carpet Wardrobe Styling
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-luxury-gold hover:underline">
                  Book an Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Beauty Store */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest-luxury font-semibold text-luxury-gold">
              Beauty Store
            </h4>
            <ul className="space-y-2.5 text-xs text-luxury-muted">
              <li>
                <Link to="/shop" className="hover:text-luxury-white transition-colors">
                  Imperial Hair Elixirs
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-luxury-white transition-colors">
                  24K Gold Cellular Skincare
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-luxury-white transition-colors">
                  Botanical Body Soufflés
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-luxury-white transition-colors">
                  Nail Recovery Nectars
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-luxury-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Flagship Location & Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest-luxury font-semibold text-luxury-gold">
              Flagship Suite
            </h4>
            <div className="space-y-2 text-xs text-luxury-muted leading-relaxed">
              <p className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-luxury-gold mt-0.5 flex-shrink-0" />
                <span>12A Victoria Island Luxury Blvd, Lagos, Nigeria</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-luxury-gold flex-shrink-0" />
                <span>+234 800 242 6670</span>
              </p>
              <div className="pt-2 border-t border-luxury-border/40 mt-3">
                <p className="text-[11px] font-medium text-luxury-white">Opening Hours:</p>
                <p className="text-[11px]">Mon – Sat: 9:00 AM – 7:00 PM</p>
                <p className="text-[11px]">Sunday: 12:00 PM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-luxury-border bg-luxury-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luxury-darkmuted space-y-4 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} AGAMOS. All rights reserved. Salon · Beauty Store · Spa.</p>
          <div className="flex space-x-6">
            <Link to="/faq" className="hover:text-luxury-muted transition-colors">
              FAQ
            </Link>
            <Link to="/terms" className="hover:text-luxury-muted transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="hover:text-luxury-muted transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
