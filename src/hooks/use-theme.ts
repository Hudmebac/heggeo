
"use client";

import type { Theme } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'heggeo-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light'); // Default to light
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) {
        setThemeState(storedTheme);
      } else {
        // Fallback to system preference if no theme is stored
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // setThemeState(prefersDark ? 'dark' : 'light'); 
        // For now, defaulting to light if nothing stored to match initial script behavior
         setThemeState('light');
      }
    } catch (e) {
      // localStorage can be unavailable in some environments (e.g. private browsing, SSR)
      console.warn("Could not access localStorage for theme:", e);
      setThemeState('light'); // Default theme
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
       console.warn("Could not save theme to localStorage:", e);
    }

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'hc-light', 'hc-dark');
    
    if (newTheme !== 'light') { // 'light' is the default (no class or 'light' class)
        root.classList.add(newTheme);
    }
  }, []);

  useEffect(() => {
    if (isMounted) { // Apply theme only after initial mount and localStorage check
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'hc-light', 'hc-dark'); // Clear previous
        
        if (theme !== 'light') {
             root.classList.add(theme);
        }
    }
  }, [theme, isMounted]);
  
  // Return a stable setTheme function that only updates after mount
  const stableSetTheme = useCallback((newTheme: Theme) => {
    if (isMounted) {
      setTheme(newTheme);
    }
  }, [isMounted, setTheme]);

  return { theme: isMounted ? theme : 'light' , setTheme: stableSetTheme, isMounted };
}
