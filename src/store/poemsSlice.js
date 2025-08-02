// src/store/poemsSlice.js - Optimized with 15-minute comprehensive caching

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  databases,
  DATABASE_ID,
  POEMS_COLLECTION_ID,
} from "../services/appwrite";
import { Query } from "appwrite";

// Helper function to perform client-side filtering
const filterPoems = (poems, filters) => {
  let results = poems;

  // Apply category filter
  if (filters.category) {
    results = results.filter(
      (poem) => poem.category?.toLowerCase() === filters.category.toLowerCase()
    );
  }

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim().toLowerCase();
    results = results.filter((poem) => {
      const titleEn = poem.title_en?.toLowerCase() || "";
      const titleUr = poem.title_ur?.toLowerCase() || "";
      const contentEn = poem.content_en?.toLowerCase() || "";
      const contentUr = poem.content_ur?.toLowerCase() || "";
      const category = poem.category?.toLowerCase() || "";

      return (
        titleEn.includes(searchTerm) ||
        titleUr.includes(searchTerm) ||
        contentEn.includes(searchTerm) ||
        contentUr.includes(searchTerm) ||
        category.includes(searchTerm)
      );
    });
  }

  return results;
};

// Enhanced fetchPoems with comprehensive caching strategy
export const fetchPoems = createAsyncThunk(
  "poems/fetchPoems",
  async (
    { search = "", category = "", forceRefresh = false } = {},
    { getState }
  ) => {
    const state = getState();
    const { allPoems, lastFetched } = state.poems;

    // 15-minute cache
    const CACHE_TIME = 15 * 60 * 1000;
    const now = Date.now();
    const isCacheValid = lastFetched && now - lastFetched < CACHE_TIME;

    console.log("🔍 Poems Cache Check:", {
      hasAllPoems: allPoems && allPoems.length > 0,
      isCacheValid,
      cacheAge: lastFetched
        ? Math.round((now - lastFetched) / 1000) + "s"
        : "never",
      filters: { search, category },
    });

    // If we have cached data and it's valid, use client-side filtering
    if (!forceRefresh && allPoems && allPoems.length > 0 && isCacheValid) {
      console.log("🟢 Using cached data with client-side filtering");
      const filteredPoems = filterPoems(allPoems, { search, category });

      return {
        poems: filteredPoems,
        allPoems: allPoems, // Keep the full dataset
        fromCache: true,
        appliedFilters: { search, category },
      };
    }

    // Fetch fresh data from API
    console.log("🔄 Fetching fresh data from API");

    try {
      const queries = [];

      // Only add server-side filtering for performance on large datasets
      // For smaller datasets, client-side filtering is more efficient
      queries.push(Query.orderDesc("$createdAt"));
      queries.push(Query.limit(1000)); // Increased limit to get more data

      console.log("API queries:", queries);

      const response = await databases.listDocuments(
        DATABASE_ID,
        POEMS_COLLECTION_ID,
        queries
      );

      console.log("Raw API response:", response.documents.length, "documents");

      const allPoemsData = response.documents;

      // Apply client-side filtering to the fresh data
      const filteredPoems = filterPoems(allPoemsData, { search, category });

      return {
        poems: filteredPoems,
        allPoems: allPoemsData, // Store complete dataset for future filtering
        fromCache: false,
        appliedFilters: { search, category },
      };
    } catch (error) {
      console.error("Error in fetchPoems:", error);
      throw new Error(error.message);
    }
  }
);

// Client-side filtering action (no API call)
export const filterPoemsLocally = createAsyncThunk(
  "poems/filterLocally",
  async ({ search = "", category = "" }, { getState }) => {
    const state = getState();
    const { allPoems } = state.poems;

    if (!allPoems || allPoems.length === 0) {
      // If no cached data, fetch from API
      throw new Error("NO_CACHED_DATA");
    }

    console.log("🔧 Applying local filters:", { search, category });
    const filteredPoems = filterPoems(allPoems, { search, category });

    return {
      poems: filteredPoems,
      appliedFilters: { search, category },
      fromCache: true,
    };
  }
);

// Enhanced fetchFeaturedPoems with 15-minute cache
export const fetchFeaturedPoems = createAsyncThunk(
  "poems/fetchFeaturedPoems",
  async (_, { getState }) => {
    const state = getState();
    const { featuredPoems, featuredLastFetched, allPoems } = state.poems;

    const CACHE_TIME = 15 * 60 * 1000;
    const now = Date.now();
    const isCacheValid =
      featuredLastFetched && now - featuredLastFetched < CACHE_TIME;

    console.log("🔍 Featured Cache Check:", {
      hasData: featuredPoems.length > 0,
      isCacheValid,
      cacheAge: featuredLastFetched
        ? Math.round((now - featuredLastFetched) / 1000) + "s"
        : "never",
    });

    // Use cached featured poems if available
    if (featuredPoems.length > 0 && isCacheValid) {
      console.log("🟢 Using cached featured poems");
      return { poems: featuredPoems, fromCache: true };
    }

    // Try to extract featured poems from allPoems cache first
    if (allPoems && allPoems.length > 0) {
      const featuredFromCache = allPoems
        .filter((poem) => poem.featured === true)
        .slice(0, 6);
      if (featuredFromCache.length > 0) {
        console.log("🟢 Extracted featured poems from allPoems cache");
        return { poems: featuredFromCache, fromCache: true };
      }
    }

    console.log("🔄 Fetching fresh featured poems from API");

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POEMS_COLLECTION_ID,
        [Query.equal("featured", true), Query.limit(6)]
      );
      return { poems: response.documents, fromCache: false };
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

// Add new poem (admin only)
export const addPoem = createAsyncThunk("poems/addPoem", async (poemData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      POEMS_COLLECTION_ID,
      "unique()",
      poemData
    );
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
});

const poemsSlice = createSlice({
  name: "poems",
  initialState: {
    poems: [], // Currently displayed poems (filtered)
    allPoems: [], // Complete dataset for client-side filtering
    featuredPoems: [],
    loading: false,
    error: null,
    lastFetched: null,
    featuredLastFetched: null,
    isInitialized: false,
    currentFilters: { search: "", category: "" },
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
      console.log("🗑️ All cache cleared");
    },
    forceRefresh: (state) => {
      state.lastFetched = null;
      state.featuredLastFetched = null;
      console.log("🔄 Cache invalidated - next fetch will be fresh");
    },
    // Local filtering without API calls
    setLocalFilters: (state, action) => {
      const { search = "", category = "" } = action.payload;
      state.currentFilters = { search, category };

      if (state.allPoems && state.allPoems.length > 0) {
        state.poems = filterPoems(state.allPoems, { search, category });
        console.log(
          "🔧 Applied local filters:",
          { search, category },
          "Results:",
          state.poems.length
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPoems cases
      .addCase(fetchPoems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoems.fulfilled, (state, action) => {
        state.loading = false;
        state.poems = action.payload.poems;
        state.currentFilters = action.payload.appliedFilters;

        if (!action.payload.fromCache) {
          // Fresh data from API - update cache
          state.allPoems = action.payload.allPoems;
          state.lastFetched = Date.now();
          console.log(
            "📊 Fresh data cached:",
            action.payload.allPoems.length,
            "total poems"
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

      // filterPoemsLocally cases
      .addCase(filterPoemsLocally.fulfilled, (state, action) => {
        state.poems = action.payload.poems;
        state.currentFilters = action.payload.appliedFilters;
        console.log(
          "🔧 Local filtering applied:",
          action.payload.poems.length,
          "results"
        );
      })
      .addCase(filterPoemsLocally.rejected, (state, action) => {
        // If no cached data, this will trigger a fresh fetch
        console.log("⚠️ No cached data for local filtering");
      })

      // fetchFeaturedPoems cases
      .addCase(fetchFeaturedPoems.fulfilled, (state, action) => {
        state.featuredPoems = action.payload.poems;

        if (!action.payload.fromCache) {
          state.featuredLastFetched = Date.now();
          console.log(
            "📊 Fresh featured poems cached:",
            action.payload.poems.length
          );
        }
      })

      // addPoem cases
      .addCase(addPoem.fulfilled, (state, action) => {
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

        console.log("✅ New poem added to cache");
      });
  },
});

export const { clearError, clearCache, forceRefresh, setLocalFilters } =
  poemsSlice.actions;
export default poemsSlice.reducer;
