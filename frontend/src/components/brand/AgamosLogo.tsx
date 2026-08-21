import React from 'react';
import { Link } from 'react-router-dom';

interface AgamosLogoProps {
  variant?: 'primary' | 'stacked' | 'wordmark' | 'symbol-gold' | 'symbol-black' | 'white';
  className?: string;
  linkToHome?: boolean;
}

export const AgamosLogo: React.FC<AgamosLogoProps> = ({
  variant = 'primary',
  className = '',
  linkToHome = true,
}) => {
  const renderContent = () => {
    switch (variant) {
      case 'wordmark':
        return (
          <span className={`font-serif tracking-widest-luxury text-2xl sm:text-3xl font-semibold uppercase text-luxury-white ${className}`}>
            AGAMOS
          </span>
        );

      case 'symbol-gold':
        return (
          <svg className={`w-10 h-10 ${className}`} viewBox="0 0 120 120" fill="none">
            <defs>
              <linearGradient id="goldMonogramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5D77F" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA8820" />
              </linearGradient>
            </defs>
            <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" stroke="#D4AF37" strokeWidth="1.5" opacity="0.5" />
            <polygon points="60,12 102,36 102,84 60,108 18,36 18,84" stroke="#D4AF37" strokeWidth="0.75" opacity="0.25" />
            <path d="M42,86 L60,34 L78,86 M48,70 L72,70" stroke="url(#goldMonogramGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M78,48 C72,38 52,38 42,50 C30,64 36,86 58,86 C74,86 82,74 82,64 L60,64" stroke="url(#goldMonogramGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="60,20 62,26 68,26 63,30 65,36 60,32 55,36 57,30 52,26 58,26" fill="url(#goldMonogramGrad)" />
          </svg>
        );

      case 'symbol-black':
        return (
          <svg className={`w-10 h-10 ${className}`} viewBox="0 0 120 120" fill="none">
            <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" stroke="#111111" strokeWidth="2" opacity="0.8" />
            <path d="M42,86 L60,34 L78,86 M48,70 L72,70" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M78,48 C72,38 52,38 42,50 C30,64 36,86 58,86 C74,86 82,74 82,64 L60,64" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'stacked':
        return (
          <div className={`flex flex-col items-center text-center select-none ${className}`}>
            <svg className="w-12 h-12 mb-2" viewBox="0 0 120 120" fill="none">
              <defs>
                <linearGradient id="stackedGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5D77F" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA8820" />
                </linearGradient>
              </defs>
              <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" stroke="#D4AF37" strokeWidth="1.5" opacity="0.4" />
              <path d="M42,86 L60,34 L78,86 M48,70 L72,70" stroke="url(#stackedGoldGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M78,48 C72,38 52,38 42,50 C30,64 36,86 58,86 C74,86 82,74 82,64 L60,64" stroke="url(#stackedGoldGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points="60,20 62,26 68,26 63,30 65,36 60,32 55,36 57,30 52,26 58,26" fill="url(#stackedGoldGrad)" />
            </svg>
            <span className="font-serif tracking-widest-luxury text-2xl sm:text-3xl font-semibold text-luxury-white">
              AGAMOS
            </span>
            <span className="font-sans text-[9px] sm:text-[10px] tracking-ultra-wide text-luxury-gold uppercase mt-1">
              Salon · Beauty Store · Spa
            </span>
          </div>
        );

      case 'white':
        return (
          <div className={`flex items-center space-x-3 select-none ${className}`}>
            <svg className="w-9 h-9 flex-shrink-0" viewBox="0 0 120 120" fill="none">
              <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
              <path d="M42,86 L60,34 L78,86 M48,70 L72,70" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M78,48 C72,38 52,38 42,50 C30,64 36,86 58,86 C74,86 82,74 82,64 L60,64" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col">
              <span className="font-serif tracking-widest-luxury text-xl sm:text-2xl font-semibold text-luxury-black">
                AGAMOS
              </span>
              <span className="font-sans text-[8px] sm:text-[9px] tracking-widest-luxury text-luxury-gold font-medium uppercase">
                Salon · Beauty Store · Spa
              </span>
            </div>
          </div>
        );

      case 'primary':
      default:
        return (
          <div className={`flex items-center space-x-3.5 select-none ${className}`}>
            <svg className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0" viewBox="0 0 120 120" fill="none">
              <defs>
                <linearGradient id="primaryLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5D77F" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA8820" />
                </linearGradient>
              </defs>
              <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" stroke="#D4AF37" strokeWidth="1.5" opacity="0.4" />
              <polygon points="60,12 102,36 102,84 60,108 18,36 18,84" stroke="#D4AF37" strokeWidth="0.75" opacity="0.2" />
              <path d="M42,86 L60,34 L78,86 M48,70 L72,70" stroke="url(#primaryLogoGold)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M78,48 C72,38 52,38 42,50 C30,64 36,86 58,86 C74,86 82,74 82,64 L60,64" stroke="url(#primaryLogoGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points="60,20 62,26 68,26 63,30 65,36 60,32 55,36 57,30 52,26 58,26" fill="url(#primaryLogoGold)" />
            </svg>
            <div className="flex flex-col text-left">
              <span className="font-serif tracking-widest-luxury text-xl sm:text-2xl font-semibold leading-tight text-luxury-white">
                AGAMOS
              </span>
              <span className="font-sans text-[8px] sm:text-[9px] tracking-ultra-wide text-luxury-gold uppercase mt-0.5 font-medium">
                Salon · Beauty Store · Spa
              </span>
            </div>
          </div>
        );
    }
  };

  if (linkToHome) {
    return (
      <Link to="/" className="inline-block transition-opacity hover:opacity-90">
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
};
