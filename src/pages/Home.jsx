// src/pages/Home.jsx - Optimized with improved caching strategy

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getTranslation } from "../utils/translations";
import {
  fetchFeaturedPoems,
  filterPoemsLocally,
  fetchPoems,
} from "../store/poemsSlice";
import { fetchCategories } from "../store/categoriesSlice";
import SearchBar from "../components/common/SearchBar";
import PoemGrid from "../components/poems/PoemGrid";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Home = () => {
  const dispatch = useDispatch();
  const { language } = useTheme();

  const {
    featuredPoems,
    loading,
    isInitialized,
    featuredLastFetched,
    allPoems,
    lastFetched,
  } = useSelector((state) => state.poems);

  const { categories, isInitialized: categoriesInitialized } = useSelector(
    (state) => state.categories
  );

  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize data with smart caching
  useEffect(() => {
    const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();

    // Check cache validity
    const isFeaturedCacheValid =
      featuredLastFetched && now - featuredLastFetched < CACHE_TIME;
    const isCategoriesCacheValid = categoriesInitialized;

    console.log("🏠 Home initialization check:", {
      featuredPoems: featuredPoems.length,
      isFeaturedCacheValid,
      categoriesInitialized: isCategoriesCacheValid,
    });

    // Only fetch what's needed
    const promises = [];

    if (!isFeaturedCacheValid || featuredPoems.length === 0) {
      console.log("🔄 Loading featured poems");
      promises.push(dispatch(fetchFeaturedPoems()));
    } else {
      console.log("🟢 Using cached featured poems");
    }

    if (!isCategoriesCacheValid) {
      console.log("🔄 Loading categories");
      promises.push(dispatch(fetchCategories()));
    } else {
      console.log("🟢 Using cached categories");
    }

    // Pre-load all poems in background if not cached (for better search performance)
    const isPoemsCacheValid = lastFetched && now - lastFetched < CACHE_TIME;
    if (!isPoemsCacheValid && allPoems.length === 0) {
      console.log("🔄 Pre-loading all poems for search optimization");
      promises.push(dispatch(fetchPoems({})));
    }

    // Execute only necessary API calls
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        console.log("✅ Home data initialization complete");
      });
    } else {
      console.log("✅ All data available from cache");
    }
  }, []); // Empty dependency array - run once

  // Optimized search with local filtering
  const handleSearch = useCallback(
    async (searchTerm) => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        setHasSearched(true);

        try {
          // Try local filtering first if we have cached data
          if (allPoems && allPoems.length > 0) {
            console.log("🔍 Using local search on cached data");
            const result = await dispatch(
              filterPoemsLocally({ search: searchTerm })
            );
            const poems = result.payload?.poems || [];
            setSearchResults(poems);
          } else {
            // Fallback to API search if no cached data
            console.log("🔍 Fetching search results from API");
            const result = await dispatch(fetchPoems({ search: searchTerm }));
            const poems = Array.isArray(result.payload)
              ? result.payload
              : result.payload?.poems || [];
            setSearchResults(poems);
          }
        } catch (error) {
          console.error("Search error:", error);
          // If local filtering fails, try API search
          if (allPoems && allPoems.length > 0) {
            console.log("🔄 Local search failed, trying API search");
            try {
              const result = await dispatch(fetchPoems({ search: searchTerm }));
              const poems = Array.isArray(result.payload)
                ? result.payload
                : result.payload?.poems || [];
              setSearchResults(poems);
            } catch (apiError) {
              console.error("API search also failed:", apiError);
              setSearchResults([]);
            }
          } else {
            setSearchResults([]);
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setHasSearched(false);
        setSearchResults([]);
        setIsSearching(false);
      }
    },
    [dispatch, allPoems]
  );

  const handleClearSearch = useCallback(() => {
    setHasSearched(false);
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1
          className={`text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4 ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("title", language)}
        </h1>
        <p
          className={`text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("subtitle", language)}
        </p>

        {/* Optimized Live Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder={getTranslation("searchPlaceholder", language)}
          />
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="mb-12">
          <h2
            className={`text-2xl font-semibold text-gray-800 dark:text-white mb-6 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {getTranslation("searchResults", language)} ({searchResults.length})
          </h2>
          {isSearching ? (
            <LoadingSpinner />
          ) : searchResults.length > 0 ? (
            <PoemGrid poems={searchResults} loading={false} />
          ) : (
            <div className="text-center py-8">
              <p
                className={`text-gray-500 dark:text-gray-400 text-lg ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {getTranslation("noPoems", language)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Featured Poems */}
      {!hasSearched && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2
              className={`text-3xl font-semibold text-gray-800 dark:text-white ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {getTranslation("featuredPoems", language)}
            </h2>
            <Link
              to="/categories"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              {getTranslation("viewAll", language)} →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featuredPoems.length > 0 ? (
            <PoemGrid poems={featuredPoems} loading={false} />
          ) : (
            <div className="text-center py-8">
              <p
                className={`text-gray-500 dark:text-gray-400 text-lg ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {getTranslation("noPoems", language)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Section */}
      <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {allPoems?.length || getTranslation("totalPoems", language)}
            </div>
            <div
              className={`text-gray-600 dark:text-gray-300 ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {getTranslation("sacredPoems", language)}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {getTranslation("languages", language)}
            </div>
            <div
              className={`text-gray-600 dark:text-gray-300 ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {getTranslation("languagesText", language)}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {getTranslation("spiritualPeace", language)}
            </div>
            <div
              className={`text-gray-600 dark:text-gray-300 ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {getTranslation("spiritualPeaceText", language)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
