import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getTranslation } from "../utils/translations";
import {
  databases,
  DATABASE_ID,
  POEMS_COLLECTION_ID,
} from "../services/appwrite";
import {
  ArrowLeftIcon,
  StarIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/common/LoadingSpinner";

const PoemDetail = () => {
  const { id } = useParams();
  const { language: globalLanguage } = useTheme();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [poemLanguage, setPoemLanguage] = useState(globalLanguage); // Local poem language state

  useEffect(() => {
    fetchPoem();
  }, [id]);

  // Update poem language when global language changes (initial load)
  useEffect(() => {
    setPoemLanguage(globalLanguage);
  }, [globalLanguage]);

  const fetchPoem = async () => {
    try {
      setLoading(true);
      const response = await databases.getDocument(
        DATABASE_ID,
        POEMS_COLLECTION_ID,
        id
      );
      setPoem(response);
    } catch (err) {
      setError("Poem not found");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageLabel = (language) => {
    switch (language) {
      case "en":
        return "English";
      case "ur":
        return "اردو";
      case "both":
        return "English / اردو";
      default:
        return language;
    }
  };

  const togglePoemLanguage = () => {
    setPoemLanguage(poemLanguage === "en" ? "ur" : "en");
  };

  const getTitle = () => {
    if (globalLanguage === "ur" && poem.title_ur) {
      return poem.title_ur;
    }
    return poem.title_en;
  };

  const getPoemContent = () => {
    if (poemLanguage === "ur" && poem.content_ur) {
      return poem.content_ur;
    }
    return poem.content_en;
  };

  const canToggleLanguage = poem && poem.content_en && poem.content_ur;

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
        <Link
          to="/"
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mt-4 inline-block transition-colors duration-200"
        >
          ← {getTranslation("home", globalLanguage)}
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)} // Goes one step back
          className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {getTranslation("goBack", globalLanguage)}{" "}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1
              className={`text-xl text-center md:text-3xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 md:line-clamp-1${
                globalLanguage === "ur" && poem.title_ur ? "urdu-text" : ""
              }`}
            >
              {getTitle()}
            </h1>
            {/* Show both titles if available */}
            {globalLanguage === "en" && poem.title_ur && (
              <h2 className="text-xl text-center md:text-3xl text-gray-600 dark:text-gray-400 urdu-text mb-4">
                {poem.title_ur}
              </h2>
            )}
            {globalLanguage === "ur" && poem.title_en && (
              <h2 className="text-xl text-center md:text-2xl text-gray-600 dark:text-gray-400 mb-4">
                {poem.title_en}
              </h2>
            )}
          </div>
          {poem.featured && (
            <StarIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full">
            {poem.category}
          </span>
          {/* <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
            {getLanguageLabel(poem.language)}
          </span> */}

          {/* Local Language Toggle for Poem Content */}
          {canToggleLanguage && (
            <button
              onClick={togglePoemLanguage}
              className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title={
                poemLanguage === "en" ? "Switch to Urdu" : "Switch to English"
              }
            >
              <LanguageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {poemLanguage === "en" ? "اردو" : "EN"}
              </span>
            </button>
          )}
        </div>

        {/* Poem Content */}
        <div className="prose max-w-none">
          <div className="mb-8">
            <div
              className={`whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg  text-center ${
                poemLanguage === "ur" ? "urdu-text text-base sm-text-xl" : ""
              }`}
            >
              {getPoemContent()}
            </div>
          </div>
        </div>

        {/* description */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
            {getTranslation("description", globalLanguage)}:&nbsp;
            {(poemLanguage === "ur"
              ? poem.description_ur || poem.description_en
              : poem.description_en || poem.description_ur
            )?.trim() || getTranslation("not_provided", globalLanguage)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoemDetail;
