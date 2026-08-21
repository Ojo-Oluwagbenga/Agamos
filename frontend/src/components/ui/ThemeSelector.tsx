import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme, THEME_OPTIONS, LuxuryTheme } from '../../context/ThemeContext';

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { theme, setTheme, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 py-1.5 px-2.5 rounded border border-luxury-border/80 bg-luxury-card/80 hover:border-luxury-gold/60 text-luxury-white hover:text-luxury-gold transition-all duration-200 text-xs ${
          compact ? 'p-1.5' : ''
        }`}
        title={`Current Theme: ${themeConfig.name}`}
      >
        <div
          className="w-3.5 h-3.5 rounded-full border border-luxury-border flex-shrink-0 shadow-inner flex items-center justify-center"
          style={{ backgroundColor: themeConfig.bgPreview }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themeConfig.accentColor }}
          />
        </div>

        {!compact && (
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium hidden sm:inline-block">
            {themeConfig.name}
          </span>
        )}

        <Palette className="w-3.5 h-3.5 text-luxury-gold opacity-80" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-luxury-card border border-luxury-border rounded-none shadow-2xl z-50 p-2 animate-fade-in divide-y divide-luxury-border/40">
          <div className="px-3 py-2">
            <div className="flex items-center space-x-1.5 text-luxury-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-sans tracking-ultra-wide font-semibold">
                Atmosphere & Theme
              </span>
            </div>
            <p className="text-[10px] text-luxury-muted mt-0.5">
              Personalize your visual sanctuary
            </p>
          </div>

          <div className="py-1 space-y-1">
            {THEME_OPTIONS.map((option) => {
              const isSelected = theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setTheme(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-luxury-gold/15 border-l-2 border-luxury-gold text-luxury-gold'
                      : 'hover:bg-luxury-offblack text-luxury-white/90 hover:text-luxury-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Color Swatch Badge */}
                    <div
                      className="w-6 h-6 rounded-full border border-luxury-border/60 flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: option.bgPreview }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shadow"
                        style={{ backgroundColor: option.accentColor }}
                      />
                    </div>

                    <div>
                      <div className="font-serif text-xs font-medium tracking-wide">
                        {option.name}
                      </div>
                      <div className="font-sans text-[9px] text-luxury-muted">
                        {option.descriptor}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-luxury-gold flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
