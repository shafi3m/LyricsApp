// src/components/poems/CategoryFilter.jsx - Button-based filter without language selection
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getTranslation } from "../../utils/translations";

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const { language } = useTheme();

  const getCategoryName = (category) => {
    if (language === "ur" && category.name_ur) {
      return category.name_ur;
    }
    return category.name_en;
  };

  // Debug function to log filter changes
  const handleCategoryChange = (value) => {
    onCategoryChange(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 transition-colors duration-200">
      {/* Category Buttons */}
      <div className="space-y-4">
        <h4
          className={`text-lg font-semibold text-gray-800 dark:text-white mb-2 ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("categories", language)}
        </h4>

        <div className="flex flex-wrap gap-2">
          {/* All Categories Button */}
          <button
            onClick={() => handleCategoryChange("")}
            className={`px-2 py-1 sm:px-4 sm:py-2  rounded-full text-xs font-medium transition-all duration-200 ${
              selectedCategory === ""
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300"
            } ${language === "ur" ? "urdu-text" : ""}`}
          >
            {getTranslation("allCategories", language)}
          </button>

          {/* Individual Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.$id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.slug
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300"
              } ${language === "ur" && category.name_ur ? "urdu-text" : ""}`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>

        {/* Active Filter Indicator */}
        {selectedCategory && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <span
                className={`text-sm text-purple-700 dark:text-purple-300 ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {language === "ur" ? "فلٹر شدہ:" : "Filtered by:"}
                <strong className="ml-2">
                  {categories.find((cat) => cat.slug === selectedCategory)
                    ? getCategoryName(
                        categories.find((cat) => cat.slug === selectedCategory)
                      )
                    : selectedCategory}
                </strong>
              </span>
              <button
                onClick={() => handleCategoryChange("")}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 text-sm font-medium"
              >
                {language === "ur" ? "صاف کریں" : "Clear"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
