import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Award, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Our Heritage & Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-tight">
            Haute Beauty. Restorative Sanctuaries.
          </h1>
          <p className="text-sm text-luxury-muted font-light leading-relaxed">
            Founded with a commitment to architectural precision and sensory tranquility, AGAMOS stands as a beacon of modern African luxury and international cosmetic artistry.
          </p>
        </div>

        {/* The 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-luxury-card border border-luxury-border p-8 space-y-4">
            <span className="text-luxury-gold text-2xl font-serif">01</span>
            <h3 className="font-serif text-xl font-medium text-luxury-white">The Salon</h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Master precision cutting, couture bridal hair styling, and steam moisture silk therapies executed by award-winning artistic directors.
            </p>
          </div>
          <div className="bg-luxury-card border border-luxury-border p-8 space-y-4">
            <span className="text-luxury-gold text-2xl font-serif">02</span>
            <h3 className="font-serif text-xl font-medium text-luxury-white">The Beauty Store</h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Rare ingredients including green caviar, botanical ceramides, 24-karat gold sheets, and oriental oud formulated into clean, potent cosmetics.
            </p>
          </div>
          <div className="bg-luxury-card border border-luxury-border p-8 space-y-4">
            <span className="text-luxury-gold text-2xl font-serif">03</span>
            <h3 className="font-serif text-xl font-medium text-luxury-white">The Spa</h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Thermal volcanic stone massages, cellular LED light infusions, and Russian e-file nail couture in private acoustically isolated suites.
            </p>
          </div>
        </div>

        {/* Flagship Boulevard */}
        <div className="bg-luxury-offblack border border-luxury-border p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
              The Flagship Suite
            </span>
            <h2 className="font-serif text-3xl font-normal text-luxury-white">
              Victoria Island, Lagos
            </h2>
            <p className="text-xs text-luxury-muted leading-relaxed font-light">
              Our flagship destination is engineered for discretion. Each suite features private climate controls, high-fidelity acoustic insulation, and personalized refreshments to ensure absolute peace of mind during your transformation.
            </p>
            <div className="pt-2">
              <Link to="/book">
                <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Book a Private Session
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-luxury-card border border-luxury-gold/40 aspect-[4/3] flex items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <Sparkles className="w-10 h-10 text-luxury-gold mx-auto" />
              <h4 className="font-serif text-xl text-luxury-white">AGAMOS LUXURY</h4>
              <p className="text-[11px] text-luxury-muted">12A Victoria Island Luxury Boulevard, Lagos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
