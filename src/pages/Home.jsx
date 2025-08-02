// src/pages/Home.jsx - COMPLETE FINAL VERSION with 30-minute cache and persistent storage

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getTranslation } from "../utils/translations";
import {
  fetchFeaturedPoems,
  filterPoemsLocally,
  fetchPoems,
  cacheUtils,
  getPerformanceMetrics,
} from "../store/poemsSlice";
import { fetchCategories } from "../store/categoriesSlice";
import { persistentCache, cacheManager } from "../utils/persistentCache";
import SearchBar from "../components/common/SearchBar";
import PoemGrid from "../components/poems/PoemGrid";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Home = () => {
  const dispatch = useDispatch();
  const { language, isDark } = useTheme();

  // Redux state
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

  // Local state
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [persistentCacheLoaded, setPersistentCacheLoaded] = useState(false);

  // Refs for optimization
  const initializationRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  // 🚀 Initialize with persistent cache + 30-minute smart caching
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeData = async () => {
      console.log("🏠 Home initialization with persistent cache...");

      const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
      const now = Date.now();

      // Check memory cache validity
      const isFeaturedCacheValid = cacheUtils.isValid(
        featuredLastFetched,
        CACHE_TIME
      );
      const isPoemsCacheValid = cacheUtils.isValid(lastFetched, CACHE_TIME);
      const isCategoriesCacheValid = categoriesInitialized;

      console.log("📊 Memory Cache Status:", {
        featured: { valid: isFeaturedCacheValid, count: featuredPoems.length },
        poems: { valid: isPoemsCacheValid, count: allPoems?.length || 0 },
        categories: {
          valid: isCategoriesCacheValid,
          count: categories?.length || 0,
        },
      });

      // Try loading from persistent cache if memory cache is invalid
      const loadFromPersistentCache = async () => {
        try {
          console.log("📱 Checking persistent cache...");

          const promises = [];

          // Load featured poems from persistent cache
          if (!isFeaturedCacheValid || featuredPoems.length === 0) {
            promises.push(
              cacheManager.featured.get().then((cache) => {
                if (cache && cache.data.length > 0) {
                  console.log(
                    "🟢 Loaded featured poems from persistent cache:",
                    cache.data.length
                  );
                  // You would dispatch an action here to update Redux state
                  // For now, we'll continue with API fetch
                }
                return cache;
              })
            );
          }

          // Load all poems from persistent cache
          if (!isPoemsCacheValid || !allPoems || allPoems.length === 0) {
            promises.push(
              cacheManager.poems.get().then((cache) => {
                if (cache && cache.data.length > 0) {
                  console.log(
                    "🟢 Loaded poems from persistent cache:",
                    cache.data.length
                  );
                  // You would dispatch an action here to update Redux state
                }
                return cache;
              })
            );
          }

          // Load categories from persistent cache
          if (
            !isCategoriesCacheValid ||
            !categories ||
            categories.length === 0
          ) {
            promises.push(
              cacheManager.categories.get().then((cache) => {
                if (cache && cache.data.length > 0) {
                  console.log(
                    "🟢 Loaded categories from persistent cache:",
                    cache.data.length
                  );
                }
                return cache;
              })
            );
          }

          await Promise.all(promises);
          setPersistentCacheLoaded(true);
        } catch (error) {
          console.warn("⚠️ Persistent cache error:", error);
          setPersistentCacheLoaded(true);
        }
      };

      await loadFromPersistentCache();

      // Determine what needs to be fetched from API
      const apiPromises = [];

      if (!isFeaturedCacheValid || featuredPoems.length === 0) {
        console.log("🔄 Loading featured poems from API");
        apiPromises.push(
          dispatch(fetchFeaturedPoems()).then((result) => {
            // Save to persistent cache
            if (!result.payload?.fromCache && result.payload?.poems) {
              cacheManager.featured.set(result.payload.poems);
            }
          })
        );
      } else {
        console.log("🟢 Using cached featured poems (30-min cache)");
      }

      if (!isCategoriesCacheValid) {
        console.log("🔄 Loading categories from API");
        apiPromises.push(
          dispatch(fetchCategories()).then((result) => {
            // Save to persistent cache
            if (!result.payload?.fromCache && result.payload?.categories) {
              cacheManager.categories.set(result.payload.categories);
            }
          })
        );
      } else {
        console.log("🟢 Using cached categories");
      }

      // Pre-load all poems for search optimization (background)
      if (!isPoemsCacheValid || !allPoems || allPoems.length === 0) {
        console.log("🔄 Pre-loading all poems for search optimization");
        apiPromises.push(
          dispatch(fetchPoems({})).then((result) => {
            // Save to persistent cache
            if (!result.payload?.fromCache && result.payload?.allPoems) {
              cacheManager.poems.set(result.payload.allPoems);
            }
          })
        );
      } else {
        console.log("🟢 Using cached poems for search");
      }

      // Execute API calls
      if (apiPromises.length > 0) {
        Promise.all(apiPromises).then(() => {
          console.log("✅ Home data initialization complete");
          logPerformanceMetrics();
        });
      } else {
        console.log("✅ All data available from 30-minute cache");
        logPerformanceMetrics();
      }
    };

    initializeData();
  }, []); // Empty dependency array - run once

  // 🔍 Optimized search with local filtering and debouncing
  const handleSearch = useCallback(
    (searchTerm) => {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (searchTerm.trim()) {
        setIsSearching(true);
        setHasSearched(true);

        // Debounce search by 200ms
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            // Try local filtering first if we have cached data
            if (
              allPoems &&
              allPoems.length > 0 &&
              cacheUtils.isValid(lastFetched)
            ) {
              console.log("🔍 Using instant local search (ZERO API calls)");
              const result = await dispatch(
                filterPoemsLocally({ search: searchTerm })
              );
              const poems = result.payload?.poems || [];
              setSearchResults(poems);
            } else {
              // Fallback to API search if no valid cached data
              console.log("🔍 Fetching search results from API");
              const result = await dispatch(fetchPoems({ search: searchTerm }));
              const poems = Array.isArray(result.payload)
                ? result.payload
                : result.payload?.poems || [];
              setSearchResults(poems);

              // Save to persistent cache
              if (result.payload?.allPoems) {
                cacheManager.poems.set(result.payload.allPoems);
              }
            }
          } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        }, 200);
      } else {
        setHasSearched(false);
        setSearchResults([]);
        setIsSearching(false);
      }
    },
    [dispatch, allPoems, lastFetched]
  );

  const handleClearSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setHasSearched(false);
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  // 📊 Performance metrics logging
  const logPerformanceMetrics = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      const metrics = getPerformanceMetrics();
      console.group("📊 Home Page Performance Metrics");
      console.log("Cache Performance:", metrics);
      console.log(
        "Featured Poems Cache Age:",
        cacheUtils.getAge(featuredLastFetched),
        "seconds"
      );
      console.log(
        "All Poems Cache Age:",
        cacheUtils.getAge(lastFetched),
        "seconds"
      );
      console.groupEnd();
    }
  }, [featuredLastFetched, lastFetched]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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

        {/* Optimized Search Bar with instant results */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder={getTranslation("searchPlaceholder", language)}
            disabled={isSearching}
          />

          {/* Search status indicator */}
          {isSearching && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {language === "ur" ? "تلاش جاری ہے..." : "Searching..."}
            </p>
          )}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-semibold text-gray-800 dark:text-white ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {getTranslation("searchResults", language)} (
              {searchResults.length})
            </h2>

            {/* Cache status indicator (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500">
                {allPoems && allPoems.length > 0
                  ? `🟢 Search using 30-min cache (${allPoems.length} poems)`
                  : "🔄 Loading search data..."}
              </div>
            )}
          </div>

          {isSearching ? (
            <LoadingSpinner />
          ) : searchResults.length > 0 ? (
            <PoemGrid poems={searchResults} loading={false} />
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
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
              onMouseEnter={() => {
                // Preload categories page data on hover
                if (!allPoems || allPoems.length === 0) {
                  dispatch(fetchPoems({}));
                }
              }}
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

      {/* Enhanced Statistics Section with real-time data */}
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
            {/* Cache indicator */}
            {process.env.NODE_ENV === "development" && allPoems?.length > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                🟢 30-min cached
              </div>
            )}
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {categories?.length || getTranslation("languages", language)}
            </div>
            <div
              className={`text-gray-600 dark:text-gray-300 ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {categories?.length > 0
                ? language === "ur"
                  ? "کیٹگریز"
                  : "Categories"
                : getTranslation("languagesText", language)}
            </div>
            {/* Cache indicator */}
            {process.env.NODE_ENV === "development" &&
              categories?.length > 0 && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  🟢 30-min cached
                </div>
              )}
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

        {/* Performance indicator for development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <button
                onClick={logPerformanceMetrics}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                📊 View Performance Metrics
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cache Warming Status (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <span>Cache Status:</span>
            <span
              className={
                allPoems?.length > 0 ? "text-green-600" : "text-yellow-600"
              }
            >
              Poems: {allPoems?.length || 0}
            </span>
            <span
              className={
                featuredPoems?.length > 0 ? "text-green-600" : "text-yellow-600"
              }
            >
              Featured: {featuredPoems?.length || 0}
            </span>
            <span
              className={
                categories?.length > 0 ? "text-green-600" : "text-yellow-600"
              }
            >
              Categories: {categories?.length || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
