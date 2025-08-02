// src/components/poems/PoemCard.jsx - Fixed hover issues
import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { StarIcon } from "@heroicons/react/24/solid";

const PoemCard = ({ poem }) => {
  const { language } = useTheme();

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case "en":
        return "English";
      case "ur":
        return "اردو";
      case "both":
        return language === "ur" ? "English / اردو" : "English / اردو";
      default:
        return lang;
    }
  };

  const getTitle = () => {
    if (language === "ur" && poem.title_ur) {
      return poem.title_ur;
    }
    return poem.title_en;
  };

  const getCategoryName = () => {
    return poem.category;
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-2 sm:p-5">
        {/* Featured badge */}

        {/* Title - Clickable */}
        <Link
          to={`/poem/${poem.$id}`}
          className="block mb-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
        >
          <h3
            className={`text-base sm:text-xl font-semibold text-gray-800 dark:text-white ${
              language === "ur" && poem.title_ur
                ? "line-clamp-1-sm-2-urdu"
                : "line-clamp-1-sm-2"
            }`}
          >
            {getTitle()}
          </h3>
        </Link>

        {/* Category Label */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-3 py-1 rounded-full font-medium">
            {getCategoryName()}
          </span>

          {/* Language indicator */}
          {/* <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {getLanguageLabel(poem.language)}
          </span> */}
          {poem.featured && (
            <div className="flex justify-end mb-1">
              <StarIcon className="h-5 w-5 text-yellow-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoemCard;
