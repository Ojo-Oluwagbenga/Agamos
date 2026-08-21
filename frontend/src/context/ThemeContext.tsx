import React, { createContext, useContext, useState, useEffect } from 'react';

export type LuxuryTheme = 'noir' | 'champagne' | 'emerald' | 'velvet';

export interface ThemeConfig {
  id: LuxuryTheme;
  name: string;
  descriptor: string;
  isLight: boolean;
  accentColor: string;
  bgPreview: string;
}

export const THEME_OPTIONS: ThemeConfig[] = [
  {
    id: 'noir',
    name: 'Haute Noir',
    descriptor: 'Editorial Black & 24K Gold',
    isLight: false,
    accentColor: '#D4AF37',
    bgPreview: '#111111',
  },
  {
    id: 'champagne',
    name: 'Champagne Pearl',
    descriptor: 'Luminous Alabaster & Warm Gold',
    isLight: true,
    accentColor: '#C5A059',
    bgPreview: '#FAF8F5',
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    descriptor: 'Deep Malachite & Pure Gold',
    isLight: false,
    accentColor: '#D4AF37',
    bgPreview: '#081711',
  },
  {
    id: 'velvet',
    name: 'Royal Velvet',
    descriptor: 'Haute Burgundy & Rose Gold',
    isLight: false,
    accentColor: '#E2A79B',
    bgPreview: '#140810',
  },
];

interface ThemeContextType {
  theme: LuxuryTheme;
  setTheme: (theme: LuxuryTheme) => void;
  isLight: boolean;
  themeConfig: ThemeConfig;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<LuxuryTheme>(() => {
    const saved = localStorage.getItem('agamos_luxury_theme') as LuxuryTheme;
    if (saved && ['noir', 'champagne', 'emerald', 'velvet'].includes(saved)) {
      return saved;
    }
    return 'noir';
  });

  const themeConfig = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const isLight = themeConfig.isLight;

  const setTheme = (newTheme: LuxuryTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('agamos_luxury_theme', newTheme);
  };

  const cycleTheme = () => {
    const currentIndex = THEME_OPTIONS.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex].id);
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove all previous theme classes
    root.classList.remove('theme-noir', 'theme-champagne', 'theme-emerald', 'theme-velvet', 'dark', 'light');

    // Add current theme class
    root.classList.add(`theme-${theme}`);
    if (isLight) {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }
  }, [theme, isLight]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLight, themeConfig, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
