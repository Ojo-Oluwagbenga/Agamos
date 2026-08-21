import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export interface AgamosLogoProps {
  variant?: 
    | 'primary' 
    | 'stacked' 
    | 'wordmark' 
    | 'symbol-gold' 
    | 'symbol-black' 
    | 'symbol-white' 
    | 'reversed' 
    | 'white' 
    | 'circle-emblem' 
    | 'line'
    | 'image-full';
  className?: string;
  linkToHome?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AgamosSymbolSvg: React.FC<{ 
  variant?: 'gold' | 'black' | 'white' | 'line';
  className?: string;
}> = ({ variant = 'gold', className = 'w-10 h-11' }) => {
  if (variant === 'gold') {
    return (
      <img
        src="/agamos-symbol.png"
        alt="AGAMOS Emblem"
        className={`object-contain flex-shrink-0 drop-shadow-sm ${className}`}
        loading="eager"
      />
    );
  }

  if (variant === 'black') {
    return (
      <svg className={className} viewBox="0 0 120 140" fill="none">
        <path
          d="M 68 8 C 72 24, 76 44, 62 62 C 54 72, 42 78, 38 88 C 33 100, 39 114, 52 118 C 65 122, 79 116, 85 104 C 92 90, 84 76, 72 70 C 64 66, 56 67, 51 71 C 48 73, 46 76, 48 78 C 50 80, 54 78, 59 76 C 68 73, 76 77, 78 86 C 81 96, 73 108, 60 110 C 49 112, 41 104, 43 93 C 45 83, 54 76, 64 67 C 82 50, 83 26, 68 8 Z"
          fill="#111111"
        />
        <path
          d="M 63 22 C 67 36, 66 50, 56 63 C 51 69, 45 74, 42 80 C 40 76, 43 70, 48 64 C 58 52, 60 38, 58 25 C 59 23, 62 21, 63 22 Z"
          fill="#111111"
          opacity="0.8"
        />
      </svg>
    );
  }

  if (variant === 'white') {
    return (
      <svg className={className} viewBox="0 0 120 140" fill="none">
        <path
          d="M 68 8 C 72 24, 76 44, 62 62 C 54 72, 42 78, 38 88 C 33 100, 39 114, 52 118 C 65 122, 79 116, 85 104 C 92 90, 84 76, 72 70 C 64 66, 56 67, 51 71 C 48 73, 46 76, 48 78 C 50 80, 54 78, 59 76 C 68 73, 76 77, 78 86 C 81 96, 73 108, 60 110 C 49 112, 41 104, 43 93 C 45 83, 54 76, 64 67 C 82 50, 83 26, 68 8 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 63 22 C 67 36, 66 50, 56 63 C 51 69, 45 74, 42 80 C 40 76, 43 70, 48 64 C 58 52, 60 38, 58 25 C 59 23, 62 21, 63 22 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
      </svg>
    );
  }

  // Line version
  return (
    <svg className={className} viewBox="0 0 120 140" fill="none">
      <path
        d="M 68 8 C 72 24, 76 44, 62 62 C 54 72, 42 78, 38 88 C 33 100, 39 114, 52 118 C 65 122, 79 116, 85 104 C 92 90, 84 76, 72 70 C 64 66, 56 67, 51 71 C 48 73, 46 76, 48 78 C 50 80, 54 78, 59 76 C 68 73, 76 77, 78 86 C 81 96, 73 108, 60 110 C 49 112, 41 104, 43 93 C 45 83, 54 76, 64 67 C 82 50, 83 26, 68 8 Z"
        stroke="#D4AF37"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 2"
      />
      <path
        d="M 63 22 C 67 36, 66 50, 56 63 C 51 69, 45 74, 42 80"
        stroke="#D4AF37"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AgamosLogo: React.FC<AgamosLogoProps> = ({
  variant = 'primary',
  className = '',
  linkToHome = true,
}) => {
  let isLight = false;
  try {
    const themeContext = useTheme();
    isLight = themeContext?.isLight || false;
  } catch {
    // If rendered outside ThemeProvider
    isLight = false;
  }

  const renderContent = () => {
    switch (variant) {
      case 'image-full':
        return (
          <img
            src={isLight ? '/agamos-logo-light.png' : '/agamos-logo-dark.png'}
            alt="AGAMOS Salon · Beauty Store · Spa"
            className={`h-16 sm:h-20 object-contain ${className}`}
          />
        );

      case 'wordmark':
        return (
          <span className={`font-serif tracking-widest-luxury text-2xl sm:text-3xl font-semibold uppercase text-luxury-white ${className}`}>
            AGAMOS
          </span>
        );

      case 'symbol-gold':
        return <AgamosSymbolSvg variant="gold" className={`w-10 h-11 ${className}`} />;

      case 'symbol-black':
        return <AgamosSymbolSvg variant="black" className={`w-10 h-11 ${className}`} />;

      case 'symbol-white':
        return <AgamosSymbolSvg variant="white" className={`w-10 h-11 ${className}`} />;

      case 'circle-emblem':
        return (
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF6EF] shadow-lg flex items-center justify-center border border-[#EBE4D5] p-4 ${className}`}>
            <img
              src="/agamos-symbol.png"
              alt="AGAMOS Symbol"
              className="w-14 h-16 object-contain transform hover:scale-105 transition-transform duration-300 drop-shadow-md"
            />
          </div>
        );

      case 'line':
        return (
          <div className={`flex flex-col items-center text-center select-none ${className}`}>
            <AgamosSymbolSvg variant="line" className="w-12 h-14 mb-2" />
            <span className="font-serif tracking-widest-luxury text-2xl font-semibold text-luxury-white">
              AGAMOS
            </span>
          </div>
        );

      case 'stacked':
        return (
          <div className={`flex flex-col items-center text-center select-none group ${className}`}>
            <img
              src="/agamos-symbol.png"
              alt="AGAMOS Symbol"
              className="w-12 h-14 sm:w-14 sm:h-16 object-contain mb-2 transform group-hover:scale-105 transition-transform duration-300 drop-shadow"
            />
            <span className="font-serif tracking-widest-luxury text-2xl sm:text-3xl font-semibold text-luxury-white leading-tight">
              AGAMOS
            </span>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="h-[1px] w-5 bg-luxury-gold/50" />
              <span className="font-sans text-[9px] sm:text-[10px] tracking-widest-luxury text-luxury-gold uppercase font-medium">
                Salon · Beauty Store · Spa
              </span>
              <span className="h-[1px] w-5 bg-luxury-gold/50" />
            </div>
          </div>
        );

      case 'white':
      case 'reversed':
        return (
          <div className={`flex items-center space-x-3.5 select-none bg-luxury-black/90 p-2.5 rounded border border-luxury-border ${className}`}>
            <img
              src="/agamos-symbol.png"
              alt="AGAMOS"
              className="w-9 h-11 object-contain flex-shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif tracking-widest-luxury text-xl sm:text-2xl font-semibold text-luxury-white leading-tight">
                AGAMOS
              </span>
              <span className="font-sans text-[8px] sm:text-[9px] tracking-widest-luxury text-luxury-gold uppercase mt-0.5">
                Salon · Beauty Store · Spa
              </span>
            </div>
          </div>
        );

      case 'primary':
      default:
        return (
          <div className={`flex items-center space-x-3 sm:space-x-3.5 select-none group ${className}`}>
            <img
              src="/agamos-symbol.png"
              alt="AGAMOS Logo"
              className="w-9 h-11 sm:w-10 sm:h-12 object-contain flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300 drop-shadow"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif tracking-widest-luxury text-xl sm:text-2xl font-semibold leading-none text-luxury-white">
                AGAMOS
              </span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="h-[0.5px] w-3 bg-luxury-gold/60 hidden sm:inline-block" />
                <span className="font-sans text-[7.5px] sm:text-[8.5px] tracking-widest-luxury text-luxury-gold uppercase font-medium whitespace-nowrap">
                  Salon · Beauty Store · Spa
                </span>
                <span className="h-[0.5px] w-3 bg-luxury-gold/60 hidden sm:inline-block" />
              </div>
            </div>
          </div>
        );
    }
  };

  if (linkToHome) {
    return (
      <Link to="/" className="inline-block transition-opacity hover:opacity-95">
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
};
