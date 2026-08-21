import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShoppingBag, Sparkles, Star, ShieldCheck, Clock, Award } from 'lucide-react';
import { api } from '../../services/api';
import { Service, Product, SiteSetting, Testimonial } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, productsRes, cmsRes] = await Promise.all([
          api.services.list({ featured: true }),
          api.products.list({ featured: true }),
          api.cms.getOverview(),
        ]);
        setServices(servicesRes);
        setProducts(productsRes);
        setSiteSettings(cmsRes.settings);
        setTestimonials(cmsRes.testimonials);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-luxury-black text-luxury-white">
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Image / Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxury-card via-luxury-black to-luxury-black opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-luxury-gold/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Editorial Descriptor Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 border border-luxury-gold/40 bg-luxury-offblack/80 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
            <span className="font-sans text-[10px] sm:text-xs uppercase tracking-ultra-wide text-luxury-gold font-medium">
              Salon · Beauty Store · Spa
            </span>
          </div>

          {/* Luxury Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.08] tracking-tight">
            {siteSettings?.hero_headline || 'The Sanctuary of Haute Beauty & Rejuvenation'}
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto font-sans text-sm sm:text-base text-luxury-muted font-light leading-relaxed">
            {siteSettings?.hero_subheadline ||
              'Experience bespoke salon treatments, restorative botanical spa rituals, and curated luxury cosmetics engineered for the discerning individual.'}
          </p>

          {/* Primary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/book" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="w-full" leftIcon={<Calendar className="w-4 h-4" />}>
                Book a Session
              </Button>
            </Link>
            <Link to="/shop" className="w-full sm:w-auto">
              <Button variant="outline-gold" size="lg" className="w-full" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                Shop Beauty Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Ethos Strip */}
      <section className="border-y border-luxury-border/60 bg-luxury-offblack/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-luxury-border/60">
          <div className="pt-6 md:pt-0 md:px-6 space-y-2">
            <div className="flex justify-center">
              <Award className="w-6 h-6 text-luxury-gold stroke-1 mb-1" />
            </div>
            <h3 className="font-serif text-base uppercase tracking-widest text-luxury-white">
              Haute Craftsmanship
            </h3>
            <p className="text-xs text-luxury-muted max-w-xs mx-auto leading-relaxed">
              Every appointment is executed with Swiss precision and international fashion-week artistry.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:px-6 space-y-2">
            <div className="flex justify-center">
              <ShieldCheck className="w-6 h-6 text-luxury-gold stroke-1 mb-1" />
            </div>
            <h3 className="font-serif text-base uppercase tracking-widest text-luxury-white">
              Pure Ingredients
            </h3>
            <p className="text-xs text-luxury-muted max-w-xs mx-auto leading-relaxed">
              Formulations infused with pure 24K gold leaf, botanical ceramides, and rare oriental oud.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:px-6 space-y-2">
            <div className="flex justify-center">
              <Clock className="w-6 h-6 text-luxury-gold stroke-1 mb-1" />
            </div>
            <h3 className="font-serif text-base uppercase tracking-widest text-luxury-white">
              Private Flagship Suites
            </h3>
            <p className="text-xs text-luxury-muted max-w-xs mx-auto leading-relaxed">
              Discreet, zero-overlap reservations in our Victoria Island sanctuary suites.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-luxury-border pb-6">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
              Curated Treatments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal mt-1">
              Haute Salon & Spa Rituals
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-gold hover:text-luxury-gold-light mt-4 md:mt-0 font-medium transition-colors"
          >
            <span>Explore All Treatments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-luxury-card border border-luxury-border flex flex-col justify-between transition-all duration-300 hover:border-luxury-gold/60 hover:shadow-2xl overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] bg-luxury-offblack overflow-hidden flex items-center justify-center">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-luxury-offblack to-luxury-card text-center">
                    <Sparkles className="w-8 h-8 text-luxury-gold/50 mb-2" />
                    <span className="font-serif text-lg tracking-widest text-luxury-white/90">
                      {service.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold mt-1">
                      {service.category_name}
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-luxury-black/90 backdrop-blur-md px-3 py-1 text-[11px] font-sans font-medium text-luxury-gold border border-luxury-gold/30">
                  {service.duration_minutes} MINS
                </div>
              </div>

              {/* Service Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
                    {service.category_name}
                  </span>
                  <h3 className="font-serif text-xl font-medium text-luxury-white mt-1 group-hover:text-luxury-gold transition-colors leading-tight">
                    {service.name}
                  </h3>
                  <p className="text-xs text-luxury-muted mt-2 line-clamp-2 leading-relaxed">
                    {service.short_description}
                  </p>
                </div>

                <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between">
                  <span className="font-sans text-base font-semibold text-luxury-white">
                    {formatNGN(service.price)}
                  </span>
                  <Link to={`/book?service=${service.id}`}>
                    <Button variant="outline-gold" size="sm">
                      Reserve
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Editorial Feature: The 24K Gold Ritual */}
      <section className="bg-luxury-offblack border-y border-luxury-border py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
              Signature Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
              The 24-Karat Gold Facial & Micro-Mist Rejuvenation
            </h2>
            <p className="text-sm text-luxury-muted leading-relaxed font-light">
              Crafted in collaboration with Swiss dermatological laboratories, our signature facial deposits pure 24-karat gold sheets into the dermal barrier to stimulate cellular regeneration, tone micro-capillaries, and illuminate your complexion with an unmatchable radiance.
            </p>
            <div className="pt-4">
              <Link to="/book">
                <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Book Signature Facial
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] bg-luxury-card border border-luxury-gold/40 flex items-center justify-center p-8 text-center shadow-2xl">
              <div className="space-y-4">
                <Sparkles className="w-12 h-12 text-luxury-gold mx-auto animate-pulse" />
                <h4 className="font-serif text-2xl text-luxury-white font-medium">
                  AGAMOS PRIVATE SANCTUARY
                </h4>
                <p className="text-xs text-luxury-muted max-w-sm mx-auto leading-relaxed">
                  Complimentary champagne, private acoustic isolation, and dedicated master aesthetician for every guest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Marketplace Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-luxury-border pb-6">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
              The Beauty Store
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal mt-1">
              Curated Cosmetic Formulations
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-gold hover:text-luxury-gold-light mt-4 md:mt-0 font-medium transition-colors"
          >
            <span>View Complete Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const primaryImage = getProductImageUrl(product);

            return (
              <div
                key={product.id}
                className="group bg-luxury-card border border-luxury-border flex flex-col justify-between transition-all duration-300 hover:border-luxury-gold/60 hover:shadow-2xl"
              >
                {/* Image */}
                <div className="relative aspect-square bg-luxury-offblack overflow-hidden flex items-center justify-center p-6">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-luxury-black/90 px-2.5 py-1 text-[9px] uppercase tracking-widest text-luxury-gold border border-luxury-gold/30">
                    {product.category_name}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-luxury-white group-hover:text-luxury-gold transition-colors leading-snug">
                      <Link to={`/shop/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-xs text-luxury-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {product.short_description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between">
                    <div>
                      <span className="font-sans text-base font-semibold text-luxury-white">
                        {formatNGN(product.effective_price || product.price)}
                      </span>
                      {product.sale_price && (
                        <span className="text-xs text-luxury-muted line-through ml-2">
                          {formatNGN(product.price)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => addToCart(product, 1)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Editorial Testimonials */}
      <section className="bg-luxury-offblack border-t border-luxury-border py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
              Dispatches from our Guests
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal mt-1">
              Words of Distinction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-luxury-card border border-luxury-border p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex space-x-1 text-luxury-gold">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-luxury-gold" />
                    ))}
                  </div>
                  <p className="font-serif text-base text-luxury-white/90 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-luxury-border/60">
                  <p className="text-sm font-semibold text-luxury-white">{t.client_name}</p>
                  <p className="text-xs text-luxury-gold">{t.client_title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action Banner */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 text-center bg-luxury-black border-t border-luxury-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Reserve Your Moment
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-tight">
            Elevate Your Personal Sanctuary
          </h2>
          <p className="text-sm text-luxury-muted font-light max-w-xl mx-auto leading-relaxed">
            Appointments are scheduled with deliberate spacing to ensure undivided attention and pristine tranquility.
          </p>
          <div className="pt-4">
            <Link to="/book">
              <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Reserve An Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
