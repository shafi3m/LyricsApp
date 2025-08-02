import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getTranslation } from "../../utils/translations";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const SearchBar = ({ onSearch, onClear, placeholder, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { language } = useTheme();

  // Live search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    if (onClear) {
      onClear();
    }
  };

  const defaultPlaceholder =
    placeholder || getTranslation("searchPlaceholder", language);

  return (
    <div className={`relative max-w-md mx-auto ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={defaultPlaceholder}
          className={`w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
            focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            transition-colors duration-200 ${
              language === "ur" ? "text-right" : "text-left"
            }`}
          dir={language === "ur" ? "rtl" : "ltr"}
        />

        <MagnifyingGlassIcon
          className={`absolute top-3.5 h-5 w-5 text-gray-400 ${
            language === "ur" ? "right-3" : "left-3"
          }`}
        />

        {searchTerm && (
          <button
            onClick={handleClear}
            className={`absolute top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${
              language === "ur" ? "left-3" : "right-3"
            }`}
          >
            <XMarkIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
