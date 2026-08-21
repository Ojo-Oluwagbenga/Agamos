import React from 'react';
import { Link } from 'react-router-dom';

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
    | 'line';
  className?: string;
  linkToHome?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AgamosSymbolSvg: React.FC<{ 
  variant?: 'gold' | 'black' | 'white' | 'line';
  className?: string;
}> = ({ variant = 'gold', className = 'w-10 h-10' }) => {
  const uniqueId = React.useId().replace(/:/g, '');

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

  if (variant === 'line') {
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
  }

  // Metallic 3D Gold
  return (
    <svg className={className} viewBox="0 0 120 140" fill="none">
      <defs>
        <linearGradient id={`goldMeta_${uniqueId}`} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="25%" stopColor="#E5C158" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="75%" stopColor="#B88E28" />
          <stop offset="100%" stopColor="#805D12" />
        </linearGradient>
        <linearGradient id={`goldHi_${uniqueId}`} x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#FFF8E0" />
          <stop offset="40%" stopColor="#F2D179" />
          <stop offset="80%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#996E17" />
        </linearGradient>
        <linearGradient id={`goldSh_${uniqueId}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#996E17" />
          <stop offset="100%" stopColor="#5E430B" />
        </linearGradient>
      </defs>

      {/* Main ribbon plume & loop */}
      <path
        d="M 68 8 C 72 24, 76 44, 62 62 C 54 72, 42 78, 38 88 C 33 100, 39 114, 52 118 C 65 122, 79 116, 85 104 C 92 90, 84 76, 72 70 C 64 66, 56 67, 51 71 C 48 73, 46 76, 48 78 C 50 80, 54 78, 59 76 C 68 73, 76 77, 78 86 C 81 96, 73 108, 60 110 C 49 112, 41 104, 43 93 C 45 83, 54 76, 64 67 C 82 50, 83 26, 68 8 Z"
        fill={`url(#goldMeta_${uniqueId})`}
      />

      {/* Feather ridge highlights */}
      <path
        d="M 63 22 C 67 36, 66 50, 56 63 C 51 69, 45 74, 42 80 C 40 76, 43 70, 48 64 C 58 52, 60 38, 58 25 C 59 23, 62 21, 63 22 Z"
        fill={`url(#goldHi_${uniqueId})`}
      />

      {/* Lower swirl shadow */}
      <path
        d="M 52 118 C 39 114, 33 100, 38 88 C 40 83, 44 79, 49 76 C 47 79, 45 84, 44 89 C 42 101, 50 109, 61 108 C 57 114, 55 117, 52 118 Z"
        fill={`url(#goldSh_${uniqueId})`}
        opacity="0.85"
      />

      {/* Third feather accent */}
      <path
        d="M 72 35 C 75 45, 74 54, 68 63 C 67 61, 69 54, 71 47 C 73 40, 72 36, 72 35 Z"
        fill={`url(#goldHi_${uniqueId})`}
        opacity="0.9"
      />
    </svg>
  );
};

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
        return <AgamosSymbolSvg variant="gold" className={`w-10 h-11 ${className}`} />;

      case 'symbol-black':
        return <AgamosSymbolSvg variant="black" className={`w-10 h-11 ${className}`} />;

      case 'symbol-white':
        return <AgamosSymbolSvg variant="white" className={`w-10 h-11 ${className}`} />;

      case 'circle-emblem':
        return (
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF6EF] shadow-lg flex items-center justify-center border border-[#EBE4D5] p-4 ${className}`}>
            <AgamosSymbolSvg variant="gold" className="w-14 h-16 transform hover:scale-105 transition-transform duration-300" />
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
          <div className={`flex flex-col items-center text-center select-none ${className}`}>
            <AgamosSymbolSvg variant="gold" className="w-11 h-13 mb-2 transform hover:scale-105 transition-transform" />
            <span className="font-serif tracking-widest-luxury text-2xl sm:text-3xl font-semibold text-luxury-white leading-tight">
              AGAMOS
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="h-[1px] w-4 bg-luxury-gold/50" />
              <span className="font-sans text-[9px] sm:text-[10px] tracking-widest-luxury text-luxury-gold uppercase font-medium">
                Salon · Beauty Store · Spa
              </span>
              <span className="h-[1px] w-4 bg-luxury-gold/50" />
            </div>
          </div>
        );

      case 'white':
      case 'reversed':
        return (
          <div className={`flex items-center space-x-3.5 select-none bg-luxury-black p-2 rounded ${className}`}>
            <AgamosSymbolSvg variant="white" className="w-9 h-10 flex-shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-serif tracking-widest-luxury text-xl sm:text-2xl font-semibold text-luxury-white leading-tight">
                AGAMOS
              </span>
              <span className="font-sans text-[8px] sm:text-[9px] tracking-widest-luxury text-luxury-white/80 uppercase mt-0.5">
                Salon · Beauty Store · Spa
              </span>
            </div>
          </div>
        );

      case 'primary':
      default:
        return (
          <div className={`flex items-center space-x-3.5 select-none group ${className}`}>
            <AgamosSymbolSvg variant="gold" className="w-9 h-10 sm:w-10 sm:h-11 flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col text-left">
              <span className="font-serif tracking-widest-luxury text-xl sm:text-2xl font-semibold leading-none text-luxury-white">
                AGAMOS
              </span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="h-[0.5px] w-3 bg-luxury-gold/60 hidden sm:inline-block" />
                <span className="font-sans text-[7.5px] sm:text-[8.5px] tracking-widest-luxury text-luxury-gold uppercase font-medium">
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
