import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Theme can be 'system' | 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('color-scheme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      // localStorage may be unavailable in some sandboxes
    }
    return 'system';
  });

  // Calculate resolved theme based on system preference if theme === 'system'
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem('color-scheme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isSystem = theme === 'system';
      const activeTheme = isSystem ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      
      setResolvedTheme(activeTheme);

      // 1. Update <meta name="color-scheme">
      let meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'color-scheme';
        document.head.appendChild(meta);
      }
      meta.content = isSystem ? 'light dark' : theme;

      // 2. Toggle .dark class on <html>
      const isDark = activeTheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);

      // 3. Persist to localStorage
      try {
        if (isSystem) {
          localStorage.removeItem('color-scheme');
        } else {
          localStorage.setItem('color-scheme', theme);
        }
      } catch (e) {}
    };

    updateTheme();

    // Listen to OS preference changes
    const handleMediaChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    // Listen to changes across browser tabs
    const handleStorageChange = (e) => {
      if (e.key === 'color-scheme') {
        const val = e.newValue;
        setTheme(val === 'light' || val === 'dark' ? val : 'system');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme: () => {
      // Toggle between light and dark
      setTheme((prev) => (resolvedTheme === 'dark' ? 'light' : 'dark'));
    }
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
