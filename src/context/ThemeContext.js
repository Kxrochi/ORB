import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext
 *
 * Provides dark/light theme state and a toggle function.
 * Persists the preference in localStorage and mirrors it to the root
 * `documentElement` via a `dark` class for Tailwind.
 */
const ThemeContext = createContext();

/**
 * useTheme
 *
 * Hook to access theme state.
 * @returns {{ isDarkMode: boolean, toggleTheme: () => void }}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * ThemeProvider
 *
 * Wraps the app and provides a persistent dark/light mode.
 * Initializes from localStorage or OS preference.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /** Toggle between dark and light modes. */
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 