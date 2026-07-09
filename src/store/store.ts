import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

/** Fresh store per client — avoids sharing state across SSR requests. */
export const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
