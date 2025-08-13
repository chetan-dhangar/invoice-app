import { configureStore } from "@reduxjs/toolkit";
import invoiceReducer from "./invoiceSlice";

export const store = configureStore({
  reducer: {
    invoices: invoiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
