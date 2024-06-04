import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { fileApi } from "./api/fileApi";
// import { donationSlice } from "./api/DonationSlice.js";
// import { bloodRequestSlice } from "./api/BloodRequestSlicer.js";

export const store = configureStore({
  reducer: {
    [fileApi.reducerPath]: fileApi.reducer
    // [donationSlice.reducerPath]: donationSlice.reducer,
    // [bloodRequestSlice.reducerPath]: bloodRequestSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      fileApi.middleware
    //   bloodRequestSlice.middleware,
    //   donationSlice.middleware
    ),
});

setupListeners(store.dispatch);
