// src/components/common/CachePreloader.jsx
// Component to preload all data on app start

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPoems, fetchFeaturedPoems } from "../../store/poemsSlice";
import { fetchCategories } from "../../store/categoriesSlice";

const CachePreloader = () => {
  const dispatch = useDispatch();
  const { isInitialized, allPoems } = useSelector((state) => state.poems);

  useEffect(() => {
    const preloadData = async () => {
      if (!isInitialized || allPoems.length === 0) {
        console.log("🚀 Preloading all app data...");

        // Fetch all poems without any filters to populate cache
        await dispatch(fetchPoems({}));

        // Fetch featured poems
        await dispatch(fetchFeaturedPoems());

        // Fetch categories
        await dispatch(fetchCategories());

        console.log("✅ App data preloaded successfully");
      } else {
        console.log("🟢 App data already cached");
      }
    };

    preloadData();
  }, []); // Run only once when app starts

  return null; // This component doesn't render anything
};

export default CachePreloader;
