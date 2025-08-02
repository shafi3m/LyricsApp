import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState("en");

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    const savedLanguage = localStorage.getItem("language");

    if (savedTheme) {
      const darkMode = savedTheme === "dark";
      setIsDark(darkMode);
      applyTheme(darkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
      applyTheme(prefersDark);
    }

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Apply theme to HTML element
  const applyTheme = (dark) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    console.log(
      "Theme applied:",
      dark ? "dark" : "light",
      "HTML classes:",
      html.className
    );
  };

  // Handle theme changes
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyTheme(isDark);
  }, [isDark]);

  // Handle language changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ur" : "en"));
  };

  const value = {
    isDark,
    language,
    toggleTheme,
    toggleLanguage,
    setLanguage,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
