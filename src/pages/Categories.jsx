// src/pages/Categories.jsx - Optimized with local filtering and improved caching

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../contexts/ThemeContext";
import { getTranslation } from "../utils/translations";
import {
  fetchPoems,
  filterPoemsLocally,
  setLocalFilters,
} from "../store/poemsSlice";
import { fetchCategories } from "../store/categoriesSlice";
import SearchBar from "../components/common/SearchBar";
import CategoryFilter from "../components/poems/CategoryFilter";
import PoemGrid from "../components/poems/PoemGrid";

const Categories = () => {
  const dispatch = useDispatch();
  const { language } = useTheme();

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

  // Refs to prevent unnecessary re-initialization
  const hasInitialized = useRef(false);
  const lastFiltersRef = useRef({ search: "", category: "" });

  // Initialize data ONCE with smart caching
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log("📂 Initializing Categories page");
      hasInitialized.current = true;

      const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
      const now = Date.now();
      const isPoemsCacheValid = lastFetched && now - lastFetched < CACHE_TIME;

      const promises = [];

      // Always fetch categories (small dataset)
      if (!categoriesInitialized) {
        console.log("🔄 Loading categories");
        promises.push(dispatch(fetchCategories()));
      } else {
        console.log("🟢 Using cached categories");
      }

      // Load poems if not cached or cache expired
      if (!isPoemsCacheValid || !isInitialized || allPoems.length === 0) {
        console.log("🔄 Loading all poems");
        promises.push(dispatch(fetchPoems({})));
      } else {
        console.log("🟢 Using cached poems data");
      }

      // Execute necessary API calls
      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          console.log("✅ Categories page initialization complete");
        });
      } else {
        console.log("✅ All data available from cache");
      }
    }
  }, []); // Empty dependency array

  // Handle search and category changes with local filtering
  useEffect(() => {
    // Skip if not initialized yet
    if (!hasInitialized.current || !allPoems || allPoems.length === 0) {
      return;
    }

    // Check if filters actually changed
    const newFilters = { search: searchTerm, category: selectedCategory };
    const lastFilters = lastFiltersRef.current;

    if (
      newFilters.search === lastFilters.search &&
      newFilters.category === lastFilters.category
    ) {
      return; // No change, skip filtering
    }

    lastFiltersRef.current = newFilters;

    console.log("🔧 Applying local filters:", newFilters);
    setIsLocalFiltering(true);

    // Use local Redux action for instant filtering
    dispatch(setLocalFilters(newFilters));
    setIsLocalFiltering(false);
  }, [searchTerm, selectedCategory, allPoems, dispatch]);

  // Optimized search handler
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

  // Generate results title
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

  // Clear individual filters
  const clearSearchFilter = useCallback(() => {
    setSearchTerm("");
  }, []);

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategory("");
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
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

        <div className="max-w-md mx-auto">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            value={searchTerm}
            placeholder={getTranslation("searchPlaceholder", language)}
          />
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="mb-6">
        <h2
          className={`text-2xl font-semibold text-gray-800 dark:text-white ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getResultsTitle()}
        </h2>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory) && (
          <div className="mt-2 flex flex-wrap gap-2">
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
          </div>
        )}

        {/* Cache Status Indicator (for development) */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mt-2 text-xs text-gray-500">
            {allPoems.length > 0
              ? `🟢 Using cached data (${allPoems.length} total poems)`
              : "🔄 Loading data..."}
          </div>
        )} */}
      </div>

      {/* Poems Grid */}
      <PoemGrid poems={poems || []} loading={loading || isLocalFiltering} />

      {/* No Results State */}
      {!loading &&
        !isLocalFiltering &&
        (!poems || poems.length === 0) &&
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
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
      {!loading && !isLocalFiltering && allPoems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">
            {language === "ur" ? "ڈیٹا لوڈ ہو رہا ہے..." : "Loading data..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Categories;
