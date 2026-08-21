import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Shield, Sparkles, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Service } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return;
      try {
        const data = await api.services.getBySlug(slug);
        setService(data);
      } catch (err) {
        console.error('Failed to load service detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 flex justify-center items-center">
        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 text-center text-luxury-white px-4">
        <h2 className="font-serif text-3xl mb-4">Treatment Not Found</h2>
        <Button variant="outline-gold" onClick={() => navigate('/services')}>
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Back Link */}
        <Link
          to="/services"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-muted hover:text-luxury-gold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Treatments</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Visual & Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] bg-luxury-card border border-luxury-border overflow-hidden flex items-center justify-center">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-luxury-offblack to-luxury-card text-center">
                  <Sparkles className="w-12 h-12 text-luxury-gold/40 mb-3" />
                  <span className="font-serif text-2xl text-luxury-white">{service.name}</span>
                </div>
              )}
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 bg-luxury-offblack border border-luxury-border p-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Duration</span>
                <span className="font-serif text-lg font-medium text-luxury-gold flex items-center space-x-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} Minutes</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Sanitization Turnover</span>
                <span className="font-serif text-lg font-medium text-luxury-white">
                  {service.buffer_time_minutes} Mins Buffer
                </span>
              </div>
            </div>
          </div>

          {/* Right Details & Booking Action */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
                {service.category_name}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                {service.name}
              </h1>
              <p className="font-sans text-2xl font-semibold text-luxury-white pt-2">
                {formatNGN(service.price)}
              </p>
            </div>

            {/* Treatment Breakdown */}
            <div className="space-y-4 pt-4 border-t border-luxury-border/60">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-white">
                Treatment Dossier
              </h3>
              <p className="text-sm text-luxury-muted font-light leading-relaxed whitespace-pre-line">
                {service.full_description || service.short_description}
              </p>
            </div>

            {/* Sanctuary Inclusions */}
            <div className="space-y-3 pt-4 border-t border-luxury-border/60">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-white">
                The AGAMOS Distinction
              </h3>
              <ul className="space-y-2 text-xs text-luxury-muted">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                  <span>Private VIP Treatment Suite with Acoustic Shielding</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                  <span>Complimentary Botanical Elixirs & Artisanal Refreshments</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                  <span>Personalized Micro-Mist Formulation tailored during session</span>
                </li>
              </ul>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-6 border-t border-luxury-border">
              <Link to={`/book?service=${service.id}`} className="block w-full">
                <Button variant="gold" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Proceed to Schedule Session
                </Button>
              </Link>
              <p className="text-center text-[11px] text-luxury-muted mt-3">
                Secure real-time reservation &bull; Paystack instant confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
