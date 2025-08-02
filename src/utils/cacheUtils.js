// src/utils/cacheUtils.js - Centralized cache management utilities

/**
 * Cache configuration constants
 */
export const CACHE_CONFIG = {
  // 15 minutes in milliseconds
  DEFAULT_CACHE_TIME: 15 * 60 * 1000,

  // Specific cache times for different data types
  POEMS_CACHE_TIME: 15 * 60 * 1000, // 15 minutes
  CATEGORIES_CACHE_TIME: 30 * 60 * 1000, // 30 minutes (categories change less)
  FEATURED_CACHE_TIME: 10 * 60 * 1000, // 10 minutes (featured might change more)

  // Cache keys for localStorage backup (optional)
  CACHE_KEYS: {
    POEMS: "poems_cache",
    CATEGORIES: "categories_cache",
    FEATURED: "featured_cache",
  },
};

/**
 * Check if cache is valid based on timestamp
 */
export const isCacheValid = (
  lastFetched,
  cacheTime = CACHE_CONFIG.DEFAULT_CACHE_TIME
) => {
  if (!lastFetched) return false;
  const now = Date.now();
  return now - lastFetched < cacheTime;
};

/**
 * Get cache age in human readable format
 */
export const getCacheAge = (lastFetched) => {
  if (!lastFetched) return "never";
  const now = Date.now();
  const ageInSeconds = Math.round((now - lastFetched) / 1000);

  if (ageInSeconds < 60) return `${ageInSeconds}s`;
  if (ageInSeconds < 3600) return `${Math.round(ageInSeconds / 60)}m`;
  return `${Math.round(ageInSeconds / 3600)}h`;
};

/**
 * Log cache status for debugging
 */
export const logCacheStatus = (cacheName, data, lastFetched, cacheTime) => {
  const hasData =
    data &&
    (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
  const isValid = isCacheValid(lastFetched, cacheTime);
  const age = getCacheAge(lastFetched);

  console.log(`🔍 ${cacheName} Cache Status:`, {
    hasData,
    isValid,
    age,
    dataSize: Array.isArray(data)
      ? data.length
      : Object.keys(data || {}).length,
  });

  return { hasData, isValid, age };
};

/**
 * Client-side filtering utilities
 */
export const filterUtils = {
  /**
   * Filter poems by search term
   */
  filterBySearch: (poems, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return poems;

    const term = searchTerm.trim().toLowerCase();
    return poems.filter((poem) => {
      const titleEn = poem.title_en?.toLowerCase() || "";
      const titleUr = poem.title_ur?.toLowerCase() || "";
      const contentEn = poem.content_en?.toLowerCase() || "";
      const contentUr = poem.content_ur?.toLowerCase() || "";
      const category = poem.category?.toLowerCase() || "";

      return (
        titleEn.includes(term) ||
        titleUr.includes(term) ||
        contentEn.includes(term) ||
        contentUr.includes(term) ||
        category.includes(term)
      );
    });
  },

  /**
   * Filter poems by category
   */
  filterByCategory: (poems, category) => {
    if (!category) return poems;
    return poems.filter(
      (poem) => poem.category?.toLowerCase() === category.toLowerCase()
    );
  },

  /**
   * Filter poems by featured status
   */
  filterByFeatured: (poems, limit = 6) => {
    return poems.filter((poem) => poem.featured === true).slice(0, limit);
  },

  /**
   * Apply multiple filters to poems
   */
  applyFilters: (poems, filters) => {
    let result = poems;

    if (filters.category) {
      result = filterUtils.filterByCategory(result, filters.category);
    }

    if (filters.search) {
      result = filterUtils.filterBySearch(result, filters.search);
    }

    if (filters.featured) {
      result = filterUtils.filterByFeatured(result, filters.limit);
    }

    return result;
  },
};

/**
 * Redux cache helpers
 */
export const cacheHelpers = {
  /**
   * Create cache check logic for async thunks
   */
  createCacheCheck: (
    cacheName,
    cacheTime = CACHE_CONFIG.DEFAULT_CACHE_TIME
  ) => {
    return (state, dataPath, timestampPath) => {
      const data = getNestedValue(state, dataPath);
      const timestamp = getNestedValue(state, timestampPath);

      const status = logCacheStatus(cacheName, data, timestamp, cacheTime);

      return {
        shouldUseCache: status.hasData && status.isValid,
        data,
        timestamp,
        ...status,
      };
    };
  },

  /**
   * Create standardized cache response
   */
  createCacheResponse: (data, fromCache = true, metadata = {}) => {
    return {
      data,
      fromCache,
      timestamp: fromCache ? null : Date.now(),
      ...metadata,
    };
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Track API call frequency
   */
  apiCallTracker: {
    calls: new Map(),

    track: (endpoint) => {
      const now = Date.now();
      const calls = performanceUtils.apiCallTracker.calls.get(endpoint) || [];
      calls.push(now);

      // Keep only calls from last hour
      const oneHourAgo = now - 60 * 60 * 1000;
      const recentCalls = calls.filter((time) => time > oneHourAgo);

      performanceUtils.apiCallTracker.calls.set(endpoint, recentCalls);

      console.log(
        `📊 API Calls to ${endpoint} in last hour:`,
        recentCalls.length
      );
      return recentCalls.length;
    },

    getStats: () => {
      const stats = {};
      performanceUtils.apiCallTracker.calls.forEach((calls, endpoint) => {
        stats[endpoint] = calls.length;
      });
      return stats;
    },

    reset: () => {
      performanceUtils.apiCallTracker.calls.clear();
    },
  },

  /**
   * Measure cache hit ratio
   */
  cacheMetrics: {
    hits: 0,
    misses: 0,

    recordHit: () => {
      performanceUtils.cacheMetrics.hits++;
      console.log(
        `📈 Cache hit ratio: ${performanceUtils.cacheMetrics.getHitRatio()}%`
      );
    },

    recordMiss: () => {
      performanceUtils.cacheMetrics.misses++;
      console.log(
        `📈 Cache hit ratio: ${performanceUtils.cacheMetrics.getHitRatio()}%`
      );
    },

    getHitRatio: () => {
      const total =
        performanceUtils.cacheMetrics.hits +
        performanceUtils.cacheMetrics.misses;
      if (total === 0) return 0;
      return Math.round((performanceUtils.cacheMetrics.hits / total) * 100);
    },

    getStats: () => ({
      hits: performanceUtils.cacheMetrics.hits,
      misses: performanceUtils.cacheMetrics.misses,
      hitRatio: performanceUtils.cacheMetrics.getHitRatio(),
    }),

    reset: () => {
      performanceUtils.cacheMetrics.hits = 0;
      performanceUtils.cacheMetrics.misses = 0;
    },
  },
};

/**
 * Helper function to get nested object values safely
 */
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

/**
 * Development helpers
 */
export const devUtils = {
  /**
   * Log cache performance summary
   */
  logCachePerformance: () => {
    if (process.env.NODE_ENV !== "development") return;

    console.group("🚀 Cache Performance Summary");
    console.log("Cache Metrics:", performanceUtils.cacheMetrics.getStats());
    console.log("API Call Stats:", performanceUtils.apiCallTracker.getStats());
    console.groupEnd();
  },

  /**
   * Clear all caches (for development)
   */
  clearAllCaches: () => {
    console.warn("🗑️ Clearing all caches (development only)");
    performanceUtils.cacheMetrics.reset();
    performanceUtils.apiCallTracker.reset();
    // Dispatch cache clear actions if needed
  },

  /**
   * Simulate cache warming
   */
  warmCache: async (dispatch, actions) => {
    console.log("🔥 Warming up caches...");
    const promises = actions.map((action) => dispatch(action()));
    await Promise.all(promises);
    console.log("✅ Cache warming complete");
  },
};

export default {
  CACHE_CONFIG,
  isCacheValid,
  getCacheAge,
  logCacheStatus,
  filterUtils,
  cacheHelpers,
  performanceUtils,
  devUtils,
};
