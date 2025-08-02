import { configureStore } from "@reduxjs/toolkit";
import poemsReducer from "./poemsSlice";
import categoriesReducer from "./categoriesSlice";

export const store = configureStore({
  reducer: {
    poems: poemsReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export default store;
