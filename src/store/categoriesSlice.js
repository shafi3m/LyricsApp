// src/store/categoriesSlice.js - Optimized with 30-minute caching

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  databases,
  DATABASE_ID,
  CATEGORIES_COLLECTION_ID,
} from "../services/appwrite";

// ⏰ 30-MINUTE CACHE CONFIGURATION
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

// 📊 Performance tracking for categories
let categoriesMetrics = {
  apiCalls: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

// 📈 Cache validation helper
const isCacheValid = (timestamp, cacheTime = CACHE_TIME) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < cacheTime;
};

// 📚 Enhanced fetchCategories with 30-minute caching
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ forceRefresh = false } = {}, { getState, rejectWithValue }) => {
    const state = getState();
    const { categories, lastFetched } = state.categories;

    const isCacheStillValid = isCacheValid(lastFetched, CACHE_TIME);

    console.log("🔍 Categories Cache Check:", {
      hasData: categories && categories.length > 0,
      isCacheValid: isCacheStillValid,
      cacheAge: lastFetched
        ? Math.round((Date.now() - lastFetched) / 1000) + "s"
        : "never",
      totalCached: categories?.length || 0,
    });

    // Use cached data if available and valid (30-minute cache)
    if (
      !forceRefresh &&
      categories &&
      categories.length > 0 &&
      isCacheStillValid
    ) {
      console.log("🟢 Using 30-minute cached categories data");
      categoriesMetrics.cacheHits++;

      return {
        categories,
        fromCache: true,
        cacheInfo: {
          age: Math.round((Date.now() - lastFetched) / 1000),
          count: categories.length,
          source: "cache",
        },
      };
    }

    console.log(
      "🔄 Fetching fresh categories from API (30-min cache expired or forced)"
    );
    categoriesMetrics.apiCalls++;
    categoriesMetrics.cacheMisses++;

    try {
      console.log(
        "Fetching categories from:",
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID
      );

      const response = await databases.listDocuments(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID,
        [] // No specific queries needed for categories
      );

      console.log(
        "Categories API response:",
        response.documents.length,
        "categories"
      );

      // Log performance metrics
      console.log("📊 Categories Performance:", {
        cacheHits: categoriesMetrics.cacheHits,
        cacheMisses: categoriesMetrics.cacheMisses,
        apiCalls: categoriesMetrics.apiCalls,
        hitRatio:
          categoriesMetrics.cacheHits + categoriesMetrics.cacheMisses > 0
            ? Math.round(
                (categoriesMetrics.cacheHits /
                  (categoriesMetrics.cacheHits +
                    categoriesMetrics.cacheMisses)) *
                  100
              ) + "%"
            : "0%",
      });

      return {
        categories: response.documents,
        fromCache: false,
        cacheInfo: {
          count: response.documents.length,
          source: "api",
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      return rejectWithValue(`Failed to fetch categories: ${error.message}`);
    }
  }
);

// ➕ Add new category (admin only)
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      categoriesMetrics.apiCalls++;

      const response = await databases.createDocument(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID,
        "unique()",
        categoryData
      );

      console.log(
        "✅ New category added:",
        response.name_en || response.name_ur
      );
      return response;
    } catch (error) {
      console.error("❌ Error adding category:", error);
      return rejectWithValue(`Failed to add category: ${error.message}`);
    }
  }
);

// 🗃 Redux Slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    // Data
    categories: [],

    // State management
    loading: false,
    error: null,
    isInitialized: false,

    // Cache management (30-minute cache)
    lastFetched: null,

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
      state.categories = [];
      state.lastFetched = null;
      state.isInitialized = false;

      // Reset performance metrics
      categoriesMetrics = {
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };

      console.log("🗑️ Categories 30-minute cache cleared");
    },

    forceRefresh: (state) => {
      state.lastFetched = null;
      console.log("🔄 Categories 30-minute cache invalidated");
    },

    updateMetrics: (state) => {
      state.metrics = {
        totalApiCalls: categoriesMetrics.apiCalls,
        cacheHits: categoriesMetrics.cacheHits,
        cacheMisses: categoriesMetrics.cacheMisses,
        lastCacheAge: state.lastFetched
          ? Math.round((Date.now() - state.lastFetched) / 1000)
          : null,
        hitRatio:
          categoriesMetrics.cacheHits + categoriesMetrics.cacheMisses > 0
            ? Math.round(
                (categoriesMetrics.cacheHits /
                  (categoriesMetrics.cacheHits +
                    categoriesMetrics.cacheMisses)) *
                  100
              )
            : 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // 📚 fetchCategories cases
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.isInitialized = true;

        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
          console.log(
            "📊 Fresh categories cached for 30 minutes:",
            action.payload.cacheInfo
          );
        } else {
          console.log(
            "📊 Using 30-minute cached categories:",
            action.payload.cacheInfo
          );
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Categories fetch rejected:", action.payload);
      })

      // ➕ addCategory cases
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        console.log("✅ New category added to 30-minute cache");
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ addCategory rejected:", action.payload);
      });
  },
});

// 📤 Export actions
export const { clearError, clearCache, forceRefresh, updateMetrics } =
  categoriesSlice.actions;

// 📊 Export performance metrics getter
export const getCategoriesMetrics = () => ({
  ...categoriesMetrics,
  hitRatio:
    categoriesMetrics.cacheHits + categoriesMetrics.cacheMisses > 0
      ? Math.round(
          (categoriesMetrics.cacheHits /
            (categoriesMetrics.cacheHits + categoriesMetrics.cacheMisses)) *
            100
        ) + "%"
      : "0%",
});

// 🔧 Export cache utilities
export const categoriesCacheUtils = {
  isValid: (timestamp) => isCacheValid(timestamp, CACHE_TIME),
  getAge: (timestamp) =>
    timestamp ? Math.round((Date.now() - timestamp) / 1000) : null,
  getRemainingTime: (timestamp) => {
    if (!timestamp) return 0;
    const remaining = CACHE_TIME - (Date.now() - timestamp);
    return Math.max(0, remaining);
  },
  cacheTime: CACHE_TIME,
};

export default categoriesSlice.reducer;
