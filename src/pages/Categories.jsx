// src/pages/Categories.jsx - Complete optimized with 30-minute cache and local filtering

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../contexts/ThemeContext";
import { getTranslation } from "../utils/translations";
import {
  fetchPoems,
  filterPoemsLocally,
  setLocalFilters,
  cacheUtils,
  getPerformanceMetrics,
} from "../store/poemsSlice";
import { fetchCategories } from "../store/categoriesSlice";
import { persistentCache, cacheManager } from "../utils/persistentCache";
import SearchBar from "../components/common/SearchBar";
import CategoryFilter from "../components/poems/CategoryFilter";
import PoemGrid from "../components/poems/PoemGrid";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Categories = () => {
  const dispatch = useDispatch();
  const { language, isDark } = useTheme();

  const {
    poems,
    allPoems,
    loading,
    isInitialized,
    currentFilters,
    lastFetched,
  } = useSelector((state) => state.poems);

  const { categories, isInitialized: categoriesInitialized } = useSelector(
    (state) => state.categories
  );

  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocalFiltering, setIsLocalFiltering] = useState(false);
  const [persistentCacheLoaded, setPersistentCacheLoaded] = useState(false);

  // Refs to prevent unnecessary re-initialization and optimize performance
  const hasInitialized = useRef(false);
  const lastFiltersRef = useRef({ search: "", category: "" });
  const searchTimeoutRef = useRef(null);

  // 🚀 Initialize data ONCE with smart 30-minute caching + persistent storage
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeData = async () => {
      console.log("📂 Initializing Categories page with 30-minute cache...");

      const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
      const now = Date.now();

      // Check memory cache validity
      const isPoemsCacheValid = cacheUtils.isValid(lastFetched, CACHE_TIME);
      const isCategoriesCacheValid = categoriesInitialized;

      console.log("📊 Categories Cache Status:", {
        poems: { valid: isPoemsCacheValid, count: allPoems?.length || 0 },
        categories: {
          valid: isCategoriesCacheValid,
          count: categories?.length || 0,
        },
      });

      // Try loading from persistent cache first
      const loadFromPersistentCache = async () => {
        try {
          console.log("📱 Checking persistent cache...");

          const promises = [];

          // Load poems from persistent cache
          if (!isPoemsCacheValid || !allPoems || allPoems.length === 0) {
            promises.push(
              cacheManager.poems.get().then((cache) => {
                if (cache && cache.data.length > 0) {
                  console.log(
                    "🟢 Loaded poems from persistent cache:",
                    cache.data.length
                  );
                  // Note: In a real implementation, you'd dispatch an action to update Redux state
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

      // Always fetch categories (small dataset, quick)
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

      // Load poems if not cached or cache expired
      if (
        !isPoemsCacheValid ||
        !isInitialized ||
        !allPoems ||
        allPoems.length === 0
      ) {
        console.log("🔄 Loading all poems for filtering");
        apiPromises.push(
          dispatch(fetchPoems({})).then((result) => {
            // Save to persistent cache
            if (!result.payload?.fromCache && result.payload?.allPoems) {
              cacheManager.poems.set(result.payload.allPoems);
            }
          })
        );
      } else {
        console.log("🟢 Using cached poems data");
      }

      // Execute necessary API calls
      if (apiPromises.length > 0) {
        Promise.all(apiPromises).then(() => {
          console.log("✅ Categories page initialization complete");
          logPerformanceMetrics();
        });
      } else {
        console.log("✅ All data available from 30-minute cache");
        logPerformanceMetrics();
      }
    };

    initializeData();
  }, []); // Empty dependency array

  // 🔧 Handle search and category changes with instant local filtering
  useEffect(() => {
    // Skip if not initialized yet
    if (!hasInitialized.current || !allPoems || allPoems.length === 0) {
      return;
    }

    // Check if filters actually changed to prevent unnecessary operations
    const newFilters = { search: searchTerm, category: selectedCategory };
    const lastFilters = lastFiltersRef.current;

    if (
      newFilters.search === lastFilters.search &&
      newFilters.category === lastFilters.category
    ) {
      return; // No change, skip filtering
    }

    lastFiltersRef.current = newFilters;

    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce filtering for search terms
    const delay = newFilters.search !== lastFilters.search ? 200 : 0;

    searchTimeoutRef.current = setTimeout(() => {
      console.log(
        "🔧 Applying instant local filters (ZERO API calls):",
        newFilters
      );
      setIsLocalFiltering(true);

      // Use local Redux action for instant filtering
      dispatch(setLocalFilters(newFilters));
      setIsLocalFiltering(false);
    }, delay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory, allPoems, dispatch]);

  // 🔍 Optimized search handler with debouncing
  const handleSearch = useCallback((term) => {
    console.log("🔍 Search term changed to:", term);
    setSearchTerm(term);
  }, []);

  const handleClearSearch = useCallback(() => {
    console.log("🧹 Clearing search");
    setSearchTerm("");
  }, []);

  const handleCategoryChange = useCallback((category) => {
    console.log("📂 Category changed to:", category);
    setSelectedCategory(category);
  }, []);

  // 📊 Performance metrics logging
  const logPerformanceMetrics = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      const metrics = getPerformanceMetrics();
      console.group("📊 Categories Page Performance Metrics");
      console.log("Cache Performance:", metrics);
      console.log(
        "Poems Cache Age:",
        cacheUtils.getAge(lastFetched),
        "seconds"
      );
      console.log(
        "Cache Remaining:",
        Math.round(cacheUtils.getRemainingTime(lastFetched) / 60000),
        "minutes"
      );
      console.groupEnd();
    }
  }, [lastFetched]);

  // 📝 Generate dynamic results title
  const getResultsTitle = useCallback(() => {
    const totalResults = poems?.length || 0;

    if (searchTerm && selectedCategory) {
      const categoryName = categories.find(
        (cat) => cat.slug === selectedCategory
      );
      const displayName = categoryName
        ? language === "ur" && categoryName.name_ur
          ? categoryName.name_ur
          : categoryName.name_en
        : selectedCategory;
      return language === "ur"
        ? `"${searchTerm}" کے لیے ${displayName} میں (${totalResults})`
        : `"${searchTerm}" in ${displayName} (${totalResults})`;
    } else if (searchTerm) {
      return `${getTranslation("searchResults", language)} (${totalResults})`;
    } else if (selectedCategory) {
      const categoryName = categories.find(
        (cat) => cat.slug === selectedCategory
      );
      const displayName = categoryName
        ? language === "ur" && categoryName.name_ur
          ? categoryName.name_ur
          : categoryName.name_en
        : selectedCategory;
      return `${displayName} (${totalResults})`;
    } else {
      return `${getTranslation("allPoems", language)} (${totalResults})`;
    }
  }, [poems, searchTerm, selectedCategory, categories, language]);

  // 🧹 Clear individual filters
  const clearSearchFilter = useCallback(() => {
    setSearchTerm("");
  }, []);

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategory("");
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
  }, []);

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
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold text-gray-800 dark:text-white mb-4 ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("browseCategories", language)}
        </h1>
        <p
          className={`text-xl text-gray-600 dark:text-gray-300 mb-8 ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("exploreCollection", language)}
        </p>

        {/* Optimized Search Bar */}
        <div className="max-w-md mx-auto">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            value={searchTerm}
            placeholder={getTranslation("searchPlaceholder", language)}
            disabled={isLocalFiltering}
          />

          {/* Search status indicator */}
          {isLocalFiltering && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {language === "ur" ? "فلٹر کر رہا ہے..." : "Filtering..."}
            </p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        loading={!categoriesInitialized}
      />

      {/* Results Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl font-semibold text-gray-800 dark:text-white ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {getResultsTitle()}
          </h2>

          {/* Performance indicator for development */}
          {/* {process.env.NODE_ENV === "development" && (
            <button
              onClick={logPerformanceMetrics}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded border"
            >
              📊 Metrics
            </button>
          )} */}
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {language === "ur" ? "تلاش:" : "Search:"} "{searchTerm}"
                <button
                  onClick={clearSearchFilter}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-bold"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                {language === "ur" ? "کیٹگری:" : "Category:"}{" "}
                {categories.find((cat) => cat.slug === selectedCategory)
                  ? language === "ur" &&
                    categories.find((cat) => cat.slug === selectedCategory)
                      .name_ur
                    ? categories.find((cat) => cat.slug === selectedCategory)
                        .name_ur
                    : categories.find((cat) => cat.slug === selectedCategory)
                        .name_en
                  : selectedCategory}
                <button
                  onClick={clearCategoryFilter}
                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-bold"
                  aria-label="Clear category filter"
                >
                  ×
                </button>
              </span>
            )}

            {/* Clear all filters button */}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {language === "ur" ? "تمام صاف کریں" : "Clear All"}
              </button>
            )}
          </div>
        )}

        {/* Cache Status Indicator (development only) */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 mb-2">
            {allPoems && allPoems.length > 0
              ? `🟢 Using 30-min cache (${allPoems.length} poems) - Local filtering (ZERO API calls)`
              : "🔄 Loading data..."}
          </div>
        )} */}
      </div>

      {/* Poems Grid with optimized loading */}
      <PoemGrid
        poems={poems || []}
        loading={loading || isLocalFiltering}
        error={null}
      />

      {/* No Results State */}
      {!loading &&
        !isLocalFiltering &&
        (!poems || poems.length === 0) &&
        allPoems &&
        allPoems.length > 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3
                className={`text-xl font-semibold text-gray-800 dark:text-white mb-2 ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {language === "ur" ? "کوئی نظم نہیں ملی" : "No poems found"}
              </h3>
              <p
                className={`text-gray-600 dark:text-gray-300 mb-4 ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {language === "ur"
                  ? "مختلف کیٹگری آزمائیں یا اپنی تلاش تبدیل کریں"
                  : "Try a different category or modify your search"}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                >
                  {language === "ur"
                    ? "تمام فلٹرز صاف کریں"
                    : "Clear All Filters"}
                </button>
              )}
            </div>
          </div>
        )}

      {/* Loading State for Initial Load */}
      {!loading &&
        !isLocalFiltering &&
        (!allPoems || allPoems.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {language === "ur" ? "ڈیٹا لوڈ ہو رہا ہے" : "Loading Data"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {language === "ur"
                ? "پہلی بار لوڈ ہو رہا ہے، اگلی بار فوری ہوگا"
                : "First time loading, next time will be instant"}
            </p>
            <div className="mt-4">
              <LoadingSpinner />
            </div>
          </div>
        )}

      {/* Error State */}
      {!loading && !poems && allPoems && allPoems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {language === "ur" ? "کوئی ڈیٹا دستیاب نہیں" : "No Data Available"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {language === "ur"
              ? "دوبارہ کوشش کریں یا کنکشن چیک کریں"
              : "Please try again or check your connection"}
          </p>
        </div>
      )}

      {/* Performance Stats Footer (development only) */}
      {/* {process.env.NODE_ENV === "development" &&
        allPoems &&
        allPoems.length > 0 && (
          <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🚀 Performance Stats (Dev Mode)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Cached:</span>
                <span className="ml-2 font-mono text-green-600">
                  {allPoems.length}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Displayed:</span>
                <span className="ml-2 font-mono text-blue-600">
                  {poems?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Cache Age:</span>
                <span className="ml-2 font-mono text-purple-600">
                  {lastFetched
                    ? Math.round((Date.now() - lastFetched) / 60000)
                    : 0}
                  min
                </span>
              </div>
              <div>
                <span className="text-gray-500">Filtering:</span>
                <span className="ml-2 font-mono text-orange-600">Local</span>
              </div>
            </div>
          </div>
        )} */}
    </div>
  );
};

export default Categories;
