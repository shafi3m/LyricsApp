// src/utils/persistentCache.js - IndexedDB persistent storage for 30-minute cache

class PersistentCache {
  constructor() {
    this.dbName = "LyricsAppCache";
    this.version = 1;
    this.db = null;
    this.isInitialized = false;

    // Store configurations
    this.stores = {
      poems: {
        name: "poems",
        keyPath: "$id",
        cacheTime: 30 * 60 * 1000, // 30 minutes
      },
      categories: {
        name: "categories",
        keyPath: "$id",
        cacheTime: 30 * 60 * 1000, // 30 minutes
      },
      featured: {
        name: "featured",
        keyPath: "$id",
        cacheTime: 30 * 60 * 1000, // 30 minutes
      },
      cache_meta: {
        name: "cache_meta",
        keyPath: "key",
      },
      preferences: {
        name: "preferences",
        keyPath: "key",
      },
    };
  }

  // 🚀 Initialize IndexedDB
  async init() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      console.log("📱 Initializing persistent cache...");

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("❌ Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log("✅ Persistent cache initialized");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log("🔧 Setting up database schema...");

        // Create object stores
        Object.values(this.stores).forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
            });
            console.log(`✅ Created store: ${store.name}`);

            // Add indexes for faster queries
            if (store.name === "poems") {
              objectStore.createIndex("category", "category", {
                unique: false,
              });
              objectStore.createIndex("featured", "featured", {
                unique: false,
              });
              objectStore.createIndex("createdAt", "$createdAt", {
                unique: false,
              });
            }
          }
        });

        console.log("✅ Database schema setup complete");
      };
    });
  }

  // 💾 Store data with 30-minute expiry
  async setCache(storeName, data, customCacheTime = null) {
    try {
      await this.init();

      const store = this.stores[storeName];
      if (!store) {
        throw new Error(`Unknown store: ${storeName}`);
      }

      const cacheTime = customCacheTime || store.cacheTime;
      const transaction = this.db.transaction(
        [store.name, "cache_meta"],
        "readwrite"
      );
      const objectStore = transaction.objectStore(store.name);
      const metaStore = transaction.objectStore("cache_meta");

      // Clear existing data
      await this.clearStore(objectStore);

      // Store new data
      if (Array.isArray(data)) {
        for (const item of data) {
          await this.addToStore(objectStore, item);
        }
      } else {
        await this.addToStore(objectStore, data);
      }

      // Store metadata
      const meta = {
        key: storeName,
        timestamp: Date.now(),
        cacheTime,
        count: Array.isArray(data) ? data.length : 1,
        dataType: Array.isArray(data) ? "array" : "object",
      };

      await this.addToStore(metaStore, meta);

      console.log(`💾 Cached ${storeName}:`, {
        count: meta.count,
        cacheTime: Math.round(cacheTime / 60000) + "min",
        expires: new Date(Date.now() + cacheTime).toLocaleTimeString(),
      });

      return true;
    } catch (error) {
      console.error(`❌ Failed to cache ${storeName}:`, error);
      return false;
    }
  }

  // 📖 Retrieve cached data
  async getCache(storeName) {
    try {
      await this.init();

      const store = this.stores[storeName];
      if (!store) {
        throw new Error(`Unknown store: ${storeName}`);
      }

      const transaction = this.db.transaction(
        [store.name, "cache_meta"],
        "readonly"
      );
      const objectStore = transaction.objectStore(store.name);
      const metaStore = transaction.objectStore("cache_meta");

      // Check cache validity
      const meta = await this.getFromStore(metaStore, storeName);
      if (!meta) {
        console.log(`📭 No cache found for ${storeName}`);
        return null;
      }

      const isExpired = Date.now() - meta.timestamp > meta.cacheTime;
      if (isExpired) {
        console.log(`⏰ Cache expired for ${storeName}:`, {
          age: Math.round((Date.now() - meta.timestamp) / 60000) + "min",
          maxAge: Math.round(meta.cacheTime / 60000) + "min",
        });

        // Clean up expired cache
        await this.clearCache(storeName);
        return null;
      }

      // Get all data
      const data = await this.getAllFromStore(objectStore);

      console.log(`📖 Retrieved cached ${storeName}:`, {
        count: data.length,
        age: Math.round((Date.now() - meta.timestamp) / 60000) + "min",
        remaining:
          Math.round((meta.cacheTime - (Date.now() - meta.timestamp)) / 60000) +
          "min",
      });

      return {
        data,
        meta: {
          ...meta,
          age: Date.now() - meta.timestamp,
          isValid: !isExpired,
          remaining: meta.cacheTime - (Date.now() - meta.timestamp),
        },
      };
    } catch (error) {
      console.error(`❌ Failed to get cache ${storeName}:`, error);
      return null;
    }
  }

  // 🗑 Clear specific cache
  async clearCache(storeName) {
    try {
      await this.init();

      const store = this.stores[storeName];
      if (!store) {
        throw new Error(`Unknown store: ${storeName}`);
      }

      const transaction = this.db.transaction(
        [store.name, "cache_meta"],
        "readwrite"
      );
      const objectStore = transaction.objectStore(store.name);
      const metaStore = transaction.objectStore("cache_meta");

      await this.clearStore(objectStore);
      await this.deleteFromStore(metaStore, storeName);

      console.log(`🗑 Cleared cache for ${storeName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to clear cache ${storeName}:`, error);
      return false;
    }
  }

  // 🧹 Clear all caches
  async clearAllCaches() {
    try {
      await this.init();

      const storeNames = Object.keys(this.stores).filter(
        (name) => name !== "preferences"
      );

      for (const storeName of storeNames) {
        await this.clearCache(storeName);
      }

      console.log("🧹 All caches cleared");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear all caches:", error);
      return false;
    }
  }

  // 💾 Store user preferences (theme, language)
  async setPreferences(preferences) {
    try {
      await this.init();

      const transaction = this.db.transaction(["preferences"], "readwrite");
      const store = transaction.objectStore("preferences");

      for (const [key, value] of Object.entries(preferences)) {
        await this.addToStore(store, { key, value, timestamp: Date.now() });
      }

      console.log("💾 Preferences saved:", preferences);
      return true;
    } catch (error) {
      console.error("❌ Failed to save preferences:", error);
      return false;
    }
  }

  // 📖 Get user preferences
  async getPreferences() {
    try {
      await this.init();

      const transaction = this.db.transaction(["preferences"], "readonly");
      const store = transaction.objectStore("preferences");
      const preferences = await this.getAllFromStore(store);

      // Convert to object
      const result = {};
      preferences.forEach((pref) => {
        result[pref.key] = pref.value;
      });

      console.log("📖 Retrieved preferences:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get preferences:", error);
      return {};
    }
  }

  // 📊 Get cache statistics
  async getCacheStats() {
    try {
      await this.init();

      const transaction = this.db.transaction(["cache_meta"], "readonly");
      const metaStore = transaction.objectStore("cache_meta");
      const allMeta = await this.getAllFromStore(metaStore);

      const stats = {};

      for (const meta of allMeta) {
        const isValid = Date.now() - meta.timestamp < meta.cacheTime;
        const age = Date.now() - meta.timestamp;
        const remaining = Math.max(0, meta.cacheTime - age);

        stats[meta.key] = {
          count: meta.count,
          isValid,
          age: Math.round(age / 1000), // seconds
          remaining: Math.round(remaining / 1000), // seconds
          cacheTime: Math.round(meta.cacheTime / 1000), // seconds
          timestamp: meta.timestamp,
        };
      }

      return stats;
    } catch (error) {
      console.error("❌ Failed to get cache stats:", error);
      return {};
    }
  }

  // 🔧 Helper methods
  async clearStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToStore(store, data) {
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFromStore(store, key) {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFromStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromStore(store, key) {
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 🧪 Development utilities
  async debugInfo() {
    if (process.env.NODE_ENV !== "development") return;

    console.group("🧪 Persistent Cache Debug Info");

    try {
      const stats = await this.getCacheStats();
      console.table(stats);

      const preferences = await this.getPreferences();
      console.log("User Preferences:", preferences);
    } catch (error) {
      console.error("Debug info error:", error);
    }

    console.groupEnd();
  }
}

// Create singleton instance
export const persistentCache = new PersistentCache();

// Export utilities
export const cacheManager = {
  // Quick access methods
  poems: {
    set: (data) => persistentCache.setCache("poems", data),
    get: () => persistentCache.getCache("poems"),
    clear: () => persistentCache.clearCache("poems"),
  },

  categories: {
    set: (data) => persistentCache.setCache("categories", data),
    get: () => persistentCache.getCache("categories"),
    clear: () => persistentCache.clearCache("categories"),
  },

  featured: {
    set: (data) => persistentCache.setCache("featured", data),
    get: () => persistentCache.getCache("featured"),
    clear: () => persistentCache.clearCache("featured"),
  },

  preferences: {
    set: (prefs) => persistentCache.setPreferences(prefs),
    get: () => persistentCache.getPreferences(),
  },

  // General utilities
  clearAll: () => persistentCache.clearAllCaches(),
  getStats: () => persistentCache.getCacheStats(),
  debug: () => persistentCache.debugInfo(),
};

export default persistentCache;
