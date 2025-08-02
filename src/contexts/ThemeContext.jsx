// src/contexts/ThemeContext.jsx - Optimized with localStorage persistence

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// localStorage keys
const STORAGE_KEYS = {
  THEME: "lyricsapp_theme",
  LANGUAGE: "lyricsapp_language",
};

// Default values
const DEFAULTS = {
  THEME: "light",
  LANGUAGE: "en",
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or defaults
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved || DEFAULTS.THEME;
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
      return DEFAULTS.THEME;
    }
  });

  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return saved || DEFAULTS.LANGUAGE;
    } catch (error) {
      console.warn("Failed to load language from localStorage:", error);
      return DEFAULTS.LANGUAGE;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const body = document.body;

      // Remove existing theme classes
      root.classList.remove("light", "dark");
      body.classList.remove("light", "dark");

      // Add current theme class
      root.classList.add(theme);
      body.classList.add(theme);

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          theme === "dark" ? "#1f2937" : "#ffffff"
        );
      }

      console.log(
        `🎨 Theme applied: ${theme} HTML classes:`,
        root.className,
        body.className
      );
    };

    applyTheme();
    setIsLoading(false);
  }, [theme]);

  // Apply language direction
  useEffect(() => {
    const applyLanguage = () => {
      const root = document.documentElement;

      // Set language and direction
      root.setAttribute("lang", language);
      root.setAttribute("dir", language === "ur" ? "rtl" : "ltr");

      // Add language-specific classes for styling
      root.classList.remove("lang-en", "lang-ur");
      root.classList.add(`lang-${language}`);

      console.log(
        `🌐 Language applied: ${language}, direction: ${
          language === "ur" ? "rtl" : "ltr"
        }`
      );
    };

    applyLanguage();
  }, [language]);

  // Persist theme changes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      setTheme(newTheme);

      // Track theme change for analytics
      if (window.gtag) {
        window.gtag("event", "theme_change", {
          theme: newTheme,
        });
      }

      console.log(`🎨 Theme toggled to: ${newTheme}`);
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error);
      // Still update state even if localStorage fails
      setTheme(newTheme);
    }
  };

  // Persist language changes
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ur" : "en";

    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      setLanguage(newLanguage);

      // Track language change for analytics
      if (window.gtag) {
        window.gtag("event", "language_change", {
          language: newLanguage,
        });
      }

      console.log(`🌐 Language toggled to: ${newLanguage}`);
    } catch (error) {
      console.error("Failed to save language to localStorage:", error);
      // Still update state even if localStorage fails
      setLanguage(newLanguage);
    }
  };

  // Set specific theme (for external controls)
  const setSpecificTheme = (newTheme) => {
    if (!["light", "dark"].includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}. Must be 'light' or 'dark'`);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      setTheme(newTheme);
      console.log(`🎨 Theme set to: ${newTheme}`);
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error);
      setTheme(newTheme);
    }
  };

  // Set specific language (for external controls)
  const setSpecificLanguage = (newLanguage) => {
    if (!["en", "ur"].includes(newLanguage)) {
      console.warn(`Invalid language: ${newLanguage}. Must be 'en' or 'ur'`);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      setLanguage(newLanguage);
      console.log(`🌐 Language set to: ${newLanguage}`);
    } catch (error) {
      console.error("Failed to save language to localStorage:", error);
      setLanguage(newLanguage);
    }
  };

  // Reset to defaults
  const resetPreferences = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.THEME);
      localStorage.removeItem(STORAGE_KEYS.LANGUAGE);
      setTheme(DEFAULTS.THEME);
      setLanguage(DEFAULTS.LANGUAGE);
      console.log("🔄 Preferences reset to defaults");
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  };

  // Get current preferences
  const getPreferences = () => ({
    theme,
    language,
    isRTL: language === "ur",
    isDark: theme === "dark",
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const hasStoredTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (!hasStoredTheme) {
        const systemTheme = e.matches ? "dark" : "light";
        setTheme(systemTheme);
        console.log(`🌙 Auto-switched to system theme: ${systemTheme}`);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Performance optimization: prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      // Current state
      theme,
      language,
      isLoading,

      // Computed values
      isDark: theme === "dark",
      isRTL: language === "ur",

      // Actions
      toggleTheme,
      toggleLanguage,
      setTheme: setSpecificTheme,
      setLanguage: setSpecificLanguage,
      resetPreferences,
      getPreferences,

      // Storage keys (for external access)
      storageKeys: STORAGE_KEYS,
    }),
    [theme, language, isLoading]
  );

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export storage utilities for external use
export const themeStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(STORAGE_KEYS[key.toUpperCase()]);
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(STORAGE_KEYS[key.toUpperCase()], value);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch {
      return false;
    }
  },

  keys: STORAGE_KEYS,
};

export default ThemeContext;
