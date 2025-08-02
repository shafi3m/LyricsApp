import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getTranslation } from "../../utils/translations";

const Footer = () => {
  const { language } = useTheme();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 mt-16 transition-colors duration-200">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <h3
            className={`text-xl font-semibold ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {getTranslation("title", language)}
          </h3>
          <p
            className={`text-gray-600 dark:text-gray-300 mt-2 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {getTranslation("footerTagline", language)}
          </p>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
          <p
            className={`text-gray-500 dark:text-gray-400 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {getTranslation("footerCopyright", language)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
