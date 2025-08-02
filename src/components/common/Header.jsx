import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { getTranslation } from "../../utils/translations";
import {
  BookOpenIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, language, toggleTheme, toggleLanguage } = useTheme();
  const location = useLocation();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
  px-3 py-2 rounded-md font-medium transition-colors duration-200
  ${language === "ur" ? "sm:text-2xl text-xl" : "text-base"}
  ${
    isActivePath(path)
      ? "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30"
      : "text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
  }
`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg transition-colors duration-200 border-b border-gray-200/50 dark:border-gray-700/50 ">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpenIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {language === "ur" ? " ردائے بخشش" : "Rida-e-Bakhshish"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/" className={navLinkClass("/")}>
              {getTranslation("home", language)}
            </Link>
            <Link to="/categories" className={navLinkClass("/categories")}>
              {getTranslation("categories", language)}
            </Link>
            <Link to="/about" className={navLinkClass("/about")}>
              {getTranslation("about", language)}
            </Link>
          </nav>

          {/* Theme and Language Controls */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/30 transition-colors duration-200"
              title={language === "en" ? "Switch to Urdu" : "Switch to English"}
            >
              {/* <LanguageIcon className="h-5 w-5" /> */}
              <span className="ml-1 text-base font-medium">
                {language === "en" ? "ار" : "EN"}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/30 transition-colors duration-200"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`block ${navLinkClass("/")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {getTranslation("home", language)}
              </Link>
              <Link
                to="/categories"
                className={`block ${navLinkClass("/categories")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {getTranslation("categories", language)}
              </Link>
              <Link
                to="/about"
                className={`block ${navLinkClass("/about")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {getTranslation("about", language)}
              </Link>

              {/* Mobile Theme and Language Controls */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t dark:border-gray-700">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/30"
                >
                  <LanguageIcon className="h-5 w-5" />
                  <span className="text-sm">
                    {language === "en" ? "اردو" : "English"}
                  </span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/30"
                >
                  {isDark ? (
                    <>
                      <SunIcon className="h-5 w-5" />
                      <span className="text-sm">Light</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5" />
                      <span className="text-sm">Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
