'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Carrega preferência salva ou detecta preferência do sistema
  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('utillar_theme') as ThemeMode) || 'light';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    let dark = false;

    if (mode === 'dark') {
      dark = true;
    } else if (mode === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      dark = false;
    }

    setIsDark(dark);

    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('utillar_theme', mode);
    applyTheme(mode);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
