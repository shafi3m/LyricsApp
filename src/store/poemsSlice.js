// src/store/poemsSlice.js - Optimized with 30-minute comprehensive caching

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  databases,
  DATABASE_ID,
  POEMS_COLLECTION_ID,
} from "../services/appwrite";
import { Query } from "appwrite";

// ⏰ 30-MINUTE CACHE CONFIGURATION
const CACHE_CONFIG = {
  POEMS: 30 * 60 * 1000, // 30 minutes
  FEATURED: 30 * 60 * 1000, // 30 minutes
  SEARCH_RESULTS: 30 * 60 * 1000, // 30 minutes
};

// 📊 Performance tracking
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  apiCalls: 0,
  searchOperations: 0,
};

// 🔧 Helper function to perform client-side filtering
const filterPoems = (poems, filters) => {
  if (!poems || !Array.isArray(poems)) return [];

  let results = poems;

  // Apply category filter
  if (filters.category && filters.category.trim()) {
    results = results.filter(
      (poem) => poem.category?.toLowerCase() === filters.category.toLowerCase()
    );
    console.log(
      `🔍 Category filter "${filters.category}": ${results.length} results`
    );
  }

  // Apply search filter with multiple field search
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim().toLowerCase();
    results = results.filter((poem) => {
      const searchableFields = [
        poem.title_en?.toLowerCase() || "",
        poem.title_ur?.toLowerCase() || "",
        poem.content_en?.toLowerCase() || "",
        poem.content_ur?.toLowerCase() || "",
        poem.category?.toLowerCase() || "",
        poem.author?.toLowerCase() || "",
        poem.tags?.join(" ").toLowerCase() || "",
      ];

      const searchableText = searchableFields.join(" ");

      // Support multiple search terms (AND operation)
      const searchTerms = searchTerm
        .split(" ")
        .filter((term) => term.length > 0);
      return searchTerms.every((term) => searchableText.includes(term));
    });

    performanceMetrics.searchOperations++;
    console.log(
      `🔍 Search filter "${filters.search}": ${results.length} results`
    );
  }

  return results;
};

// 📈 Cache validation helper
const isCacheValid = (timestamp, cacheTime) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < cacheTime;
};

// 🚀 Enhanced fetchPoems with comprehensive 30-minute caching
export const fetchPoems = createAsyncThunk(
  "poems/fetchPoems",
  async (
    { search = "", category = "", forceRefresh = false, limit = 1000 } = {},
    { getState }
  ) => {
    const state = getState();
    const { allPoems, lastFetched } = state.poems;

    const isCacheStillValid = isCacheValid(lastFetched, CACHE_CONFIG.POEMS);

    console.log("🔍 Poems Cache Check:", {
      hasAllPoems: allPoems && allPoems.length > 0,
      isCacheValid: isCacheStillValid,
      cacheAge: lastFetched
        ? Math.round((Date.now() - lastFetched) / 1000) + "s"
        : "never",
      filters: { search, category },
      totalCached: allPoems?.length || 0,
    });

    // Use cached data with client-side filtering (30-minute cache)
    if (!forceRefresh && allPoems && allPoems.length > 0 && isCacheStillValid) {
      console.log("🟢 Using 30-min cached data with client-side filtering");

      const filteredPoems = filterPoems(allPoems, { search, category });
      performanceMetrics.cacheHits++;

      return {
        poems: filteredPoems,
        allPoems: allPoems,
        fromCache: true,
        appliedFilters: { search, category },
        cacheInfo: {
          age: Math.round((Date.now() - lastFetched) / 1000),
          totalCached: allPoems.length,
          filtered: filteredPoems.length,
        },
      };
    }

    // Fetch fresh data from API
    console.log(
      "🔄 Fetching fresh data from API (30-min cache expired or forced)"
    );
    performanceMetrics.apiCalls++;
    performanceMetrics.cacheMisses++;

    try {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];

      console.log("API queries:", queries);

      const response = await databases.listDocuments(
        DATABASE_ID,
        POEMS_COLLECTION_ID,
        queries
      );

      console.log("Raw API response:", response.documents.length, "documents");

      const allPoemsData = response.documents;

      // Apply client-side filtering to fresh data
      const filteredPoems = filterPoems(allPoemsData, { search, category });

      // Log performance metrics
      console.log("📊 Performance Metrics:", {
        cacheHits: performanceMetrics.cacheHits,
        cacheMisses: performanceMetrics.cacheMisses,
        apiCalls: performanceMetrics.apiCalls,
        hitRatio:
          performanceMetrics.cacheHits + performanceMetrics.cacheMisses > 0
            ? Math.round(
                (performanceMetrics.cacheHits /
                  (performanceMetrics.cacheHits +
                    performanceMetrics.cacheMisses)) *
                  100
              ) + "%"
            : "0%",
      });

      return {
        poems: filteredPoems,
        allPoems: allPoemsData,
        fromCache: false,
        appliedFilters: { search, category },
        cacheInfo: {
          totalFetched: allPoemsData.length,
          filtered: filteredPoems.length,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error("❌ Error in fetchPoems:", error);
      throw new Error(`Failed to fetch poems: ${error.message}`);
    }
  }
);

// 🔍 Client-side filtering action (ZERO API calls)
export const filterPoemsLocally = createAsyncThunk(
  "poems/filterLocally",
  async ({ search = "", category = "" }, { getState }) => {
    const state = getState();
    const { allPoems, lastFetched } = state.poems;

    // Check if we have valid cached data
    if (
      !allPoems ||
      allPoems.length === 0 ||
      !isCacheValid(lastFetched, CACHE_CONFIG.POEMS)
    ) {
      throw new Error("NO_VALID_CACHE");
    }

    console.log("🔧 Applying local filters (ZERO API calls):", {
      search,
      category,
    });
    const filteredPoems = filterPoems(allPoems, { search, category });

    performanceMetrics.cacheHits++;
    performanceMetrics.searchOperations++;

    return {
      poems: filteredPoems,
      appliedFilters: { search, category },
      fromCache: true,
      cacheInfo: {
        totalCached: allPoems.length,
        filtered: filteredPoems.length,
        operation: "local_filter",
      },
    };
  }
);

// 🌟 Enhanced fetchFeaturedPoems with 30-minute cache
export const fetchFeaturedPoems = createAsyncThunk(
  "poems/fetchFeaturedPoems",
  async ({ forceRefresh = false } = {}, { getState }) => {
    const state = getState();
    const { featuredPoems, featuredLastFetched, allPoems, lastFetched } =
      state.poems;

    const isFeaturedCacheValid = isCacheValid(
      featuredLastFetched,
      CACHE_CONFIG.FEATURED
    );
    const isAllPoemsCacheValid = isCacheValid(lastFetched, CACHE_CONFIG.POEMS);

    console.log("🔍 Featured Cache Check:", {
      hasFeatured: featuredPoems.length > 0,
      isFeaturedCacheValid,
      hasAllPoems: allPoems && allPoems.length > 0,
      isAllPoemsCacheValid,
      featuredCacheAge: featuredLastFetched
        ? Math.round((Date.now() - featuredLastFetched) / 1000) + "s"
        : "never",
    });

    // Use cached featured poems if available and valid (30-minute cache)
    if (!forceRefresh && featuredPoems.length > 0 && isFeaturedCacheValid) {
      console.log("🟢 Using cached featured poems (30-min cache)");
      performanceMetrics.cacheHits++;

      return {
        poems: featuredPoems,
        fromCache: true,
        cacheInfo: {
          age: Math.round((Date.now() - featuredLastFetched) / 1000),
          count: featuredPoems.length,
          source: "featured_cache",
        },
      };
    }

    // Try to extract featured poems from allPoems cache if valid
    if (
      !forceRefresh &&
      allPoems &&
      allPoems.length > 0 &&
      isAllPoemsCacheValid
    ) {
      const featuredFromCache = allPoems
        .filter((poem) => poem.featured === true)
        .slice(0, 6);

      if (featuredFromCache.length > 0) {
        console.log(
          "🟢 Extracted featured poems from allPoems cache (30-min cache)"
        );
        performanceMetrics.cacheHits++;

        return {
          poems: featuredFromCache,
          fromCache: true,
          cacheInfo: {
            count: featuredFromCache.length,
            source: "all_poems_cache",
            extracted: true,
          },
        };
      }
    }

    console.log("🔄 Fetching fresh featured poems from API");
    performanceMetrics.apiCalls++;
    performanceMetrics.cacheMisses++;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POEMS_COLLECTION_ID,
        [
          Query.equal("featured", true),
          Query.orderDesc("$createdAt"),
          Query.limit(6),
        ]
      );

      return {
        poems: response.documents,
        fromCache: false,
        cacheInfo: {
          count: response.documents.length,
          source: "api",
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error("❌ Error fetching featured poems:", error);
      throw new Error(`Failed to fetch featured poems: ${error.message}`);
    }
  }
);

// ➕ Add new poem (admin only)
export const addPoem = createAsyncThunk("poems/addPoem", async (poemData) => {
  try {
    performanceMetrics.apiCalls++;

    const response = await databases.createDocument(
      DATABASE_ID,
      POEMS_COLLECTION_ID,
      "unique()",
      poemData
    );

    console.log("✅ New poem added:", response.title_en || response.title_ur);
    return response;
  } catch (error) {
    console.error("❌ Error adding poem:", error);
    throw new Error(`Failed to add poem: ${error.message}`);
  }
});

// 🗃 Redux Slice
const poemsSlice = createSlice({
  name: "poems",
  initialState: {
    // Data arrays
    poems: [], // Currently displayed poems (filtered)
    allPoems: [], // Complete dataset for client-side filtering (30-min cache)
    featuredPoems: [], // Featured poems (30-min cache)

    // State management
    loading: false,
    error: null,
    isInitialized: false,

    // Cache timestamps (30-minute cache)
    lastFetched: null,
    featuredLastFetched: null,

    // Filters and metadata
    currentFilters: { search: "", category: "" },

    // Performance metrics
    metrics: {
      totalApiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastCacheAge: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearCache: (state) => {
      state.poems = [];
      state.allPoems = [];
      state.featuredPoems = [];
      state.lastFetched = null;
      state.featuredLastFetched = null;
      state.isInitialized = false;
      state.currentFilters = { search: "", category: "" };

      // Reset performance metrics
      performanceMetrics = {
        cacheHits: 0,
        cacheMisses: 0,
        apiCalls: 0,
        searchOperations: 0,
      };

      console.log("🗑️ All 30-minute cache cleared");
    },

    forceRefresh: (state) => {
      state.lastFetched = null;
      state.featuredLastFetched = null;
      console.log("🔄 30-minute cache invalidated - next fetch will be fresh");
    },

    // Local filtering without API calls (instant)
    setLocalFilters: (state, action) => {
      const { search = "", category = "" } = action.payload;
      state.currentFilters = { search, category };

      if (state.allPoems && state.allPoems.length > 0) {
        state.poems = filterPoems(state.allPoems, { search, category });
        performanceMetrics.searchOperations++;

        console.log(
          "🔧 Applied instant local filters:",
          { search, category },
          "Results:",
          state.poems.length,
          "Search ops:",
          performanceMetrics.searchOperations
        );
      }
    },

    updateMetrics: (state) => {
      state.metrics = {
        totalApiCalls: performanceMetrics.apiCalls,
        cacheHits: performanceMetrics.cacheHits,
        cacheMisses: performanceMetrics.cacheMisses,
        lastCacheAge: state.lastFetched
          ? Math.round((Date.now() - state.lastFetched) / 1000)
          : null,
        hitRatio:
          performanceMetrics.cacheHits + performanceMetrics.cacheMisses > 0
            ? Math.round(
                (performanceMetrics.cacheHits /
                  (performanceMetrics.cacheHits +
                    performanceMetrics.cacheMisses)) *
                  100
              )
            : 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // 📚 fetchPoems cases
      .addCase(fetchPoems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoems.fulfilled, (state, action) => {
        state.loading = false;
        state.poems = action.payload.poems;
        state.currentFilters = action.payload.appliedFilters;

        if (!action.payload.fromCache) {
          // Fresh data from API - update 30-minute cache
          state.allPoems = action.payload.allPoems;
          state.lastFetched = Date.now();
          console.log(
            "📊 Fresh data cached for 30 minutes:",
            action.payload.allPoems.length,
            "total poems"
          );
        } else {
          console.log(
            "📊 Using 30-minute cached data:",
            action.payload.cacheInfo
          );
        }

        state.isInitialized = true;
        console.log("📊 Displaying poems:", action.payload.poems.length);
      })
      .addCase(fetchPoems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error("❌ fetchPoems rejected:", action.error.message);
      })

      // 🔍 filterPoemsLocally cases (ZERO API calls)
      .addCase(filterPoemsLocally.fulfilled, (state, action) => {
        state.poems = action.payload.poems;
        state.currentFilters = action.payload.appliedFilters;
        console.log(
          "🔧 Local filtering applied (ZERO API calls):",
          action.payload.cacheInfo
        );
      })
      .addCase(filterPoemsLocally.rejected, (state, action) => {
        console.log(
          "⚠️ No valid 30-minute cache for local filtering, will trigger fresh fetch"
        );
      })

      // 🌟 fetchFeaturedPoems cases
      .addCase(fetchFeaturedPoems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedPoems.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredPoems = action.payload.poems;

        if (!action.payload.fromCache) {
          state.featuredLastFetched = Date.now();
          console.log(
            "📊 Fresh featured poems cached for 30 minutes:",
            action.payload.cacheInfo
          );
        } else {
          console.log(
            "📊 Using cached featured poems:",
            action.payload.cacheInfo
          );
        }
      })
      .addCase(fetchFeaturedPoems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error("❌ fetchFeaturedPoems rejected:", action.error.message);
      })

      // ➕ addPoem cases
      .addCase(addPoem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPoem.fulfilled, (state, action) => {
        state.loading = false;

        // Add to all relevant arrays
        state.allPoems.unshift(action.payload);
        state.poems.unshift(action.payload);

        // If it's featured, add to featured poems
        if (action.payload.featured) {
          state.featuredPoems.unshift(action.payload);
          if (state.featuredPoems.length > 6) {
            state.featuredPoems = state.featuredPoems.slice(0, 6);
          }
        }

        console.log("✅ New poem added to 30-minute cache");
      })
      .addCase(addPoem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error("❌ addPoem rejected:", action.error.message);
      });
  },
});

// 📤 Export actions
export const {
  clearError,
  clearCache,
  forceRefresh,
  setLocalFilters,
  updateMetrics,
} = poemsSlice.actions;

// 📊 Export performance metrics getter
export const getPerformanceMetrics = () => ({
  ...performanceMetrics,
  hitRatio:
    performanceMetrics.cacheHits + performanceMetrics.cacheMisses > 0
      ? Math.round(
          (performanceMetrics.cacheHits /
            (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) *
            100
        ) + "%"
      : "0%",
});

// 🔧 Export cache utilities
export const cacheUtils = {
  isValid: (timestamp, cacheTime = CACHE_CONFIG.POEMS) =>
    isCacheValid(timestamp, cacheTime),
  getAge: (timestamp) =>
    timestamp ? Math.round((Date.now() - timestamp) / 1000) : null,
  getRemainingTime: (timestamp, cacheTime = CACHE_CONFIG.POEMS) => {
    if (!timestamp) return 0;
    const remaining = cacheTime - (Date.now() - timestamp);
    return Math.max(0, remaining);
  },
  config: CACHE_CONFIG,
};

export default poemsSlice.reducer;
