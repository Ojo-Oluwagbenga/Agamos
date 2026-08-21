import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Service, ServiceCategory } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, servs] = await Promise.all([
          api.services.getCategories(),
          api.services.list({
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
          }),
        ]);
        setCategories(cats);
        setServices(servs);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Bespoke Menu of Rituals
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal">
            Haute Treatments & Sanctuaries
          </h1>
          <p className="text-sm text-luxury-muted font-light leading-relaxed">
            Every session is tailored to your individual anatomy, texture, and equilibrium. Scheduled with deliberate turnover times for unparalleled privacy.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-luxury-border">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-colors border ${
                selectedCategory === 'all'
                  ? 'bg-luxury-gold text-luxury-black border-luxury-gold font-semibold'
                  : 'bg-luxury-offblack text-luxury-muted border-luxury-border hover:border-luxury-gold hover:text-luxury-white'
              }`}
            >
              All Treatments
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-colors border ${
                  selectedCategory === cat.slug
                    ? 'bg-luxury-gold text-luxury-black border-luxury-gold font-semibold'
                    : 'bg-luxury-offblack text-luxury-muted border-luxury-border hover:border-luxury-gold hover:text-luxury-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border pl-10 pr-4 py-2.5 text-xs outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-luxury-card border border-luxury-border p-6 h-80 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-luxury-card border border-luxury-border">
            <Sparkles className="w-10 h-10 text-luxury-darkmuted mx-auto mb-3" />
            <p className="font-serif text-xl text-luxury-white">No Treatments Found</p>
            <p className="text-xs text-luxury-muted mt-1">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-luxury-card border border-luxury-border flex flex-col justify-between transition-all duration-300 hover:border-luxury-gold/60 hover:shadow-2xl overflow-hidden"
              >
                <div className="relative aspect-[16/10] bg-luxury-offblack overflow-hidden flex items-center justify-center">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-luxury-offblack to-luxury-card text-center">
                      <Sparkles className="w-8 h-8 text-luxury-gold/40 mb-2" />
                      <span className="font-serif text-lg tracking-wider text-luxury-white">
                        {service.name}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-luxury-black/90 px-3 py-1 text-[10px] font-sans font-medium text-luxury-gold border border-luxury-gold/30 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{service.duration_minutes} MINS</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
                      {service.category_name}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-luxury-white mt-1 group-hover:text-luxury-gold transition-colors leading-tight">
                      <Link to={`/services/${service.slug}`}>{service.name}</Link>
                    </h3>
                    <p className="text-xs text-luxury-muted mt-2 leading-relaxed">
                      {service.short_description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Session Rate</span>
                      <span className="font-sans text-base font-semibold text-luxury-white">
                        {formatNGN(service.price)}
                      </span>
                    </div>
                    <Link to={`/book?service=${service.id}`}>
                      <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
