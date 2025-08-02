// src/store/categoriesSlice.js - Optimized with 15-minute caching

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  databases,
  DATABASE_ID,
  CATEGORIES_COLLECTION_ID,
} from "../services/appwrite";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { categories, lastFetched } = state.categories;

    // 15-minute cache
    const CACHE_TIME = 15 * 60 * 1000;
    const now = Date.now();
    const isCacheValid = lastFetched && now - lastFetched < CACHE_TIME;

    console.log("🔍 Categories Cache Check:", {
      hasData: categories && categories.length > 0,
      isCacheValid,
      cacheAge: lastFetched
        ? Math.round((now - lastFetched) / 1000) + "s"
        : "never",
    });

    // Use cached data if available and valid
    if (categories && categories.length > 0 && isCacheValid) {
      console.log("🟢 Using cached categories data");
      return { categories, fromCache: true };
    }

    console.log("🔄 Fetching fresh categories from API");

    try {
      console.log(
        "Fetching categories from:",
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID
      );
      const response = await databases.listDocuments(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID
      );
      console.log(
        "Categories API response:",
        response.documents.length,
        "categories"
      );

      return { categories: response.documents, fromCache: false };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Add new category (admin only)
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID,
        "unique()",
        categoryData
      );
      return response;
    } catch (error) {
      console.error("Error adding category:", error);
      return rejectWithValue(error.message);
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
    isInitialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.categories = [];
      state.lastFetched = null;
      state.isInitialized = false;
      console.log("🗑️ Categories cache cleared");
    },
    forceRefresh: (state) => {
      state.lastFetched = null;
      console.log("🔄 Categories cache invalidated");
    },
  },
  extraReducers: (builder) => {
    builder
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
            "📊 Fresh categories cached:",
            action.payload.categories.length
          );
        } else {
          console.log(
            "📊 Using cached categories:",
            action.payload.categories.length
          );
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Categories fetch rejected:", action.payload);
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        console.log("✅ New category added to cache");
      });
  },
});

export const { clearError, clearCache, forceRefresh } = categoriesSlice.actions;
export default categoriesSlice.reducer;
