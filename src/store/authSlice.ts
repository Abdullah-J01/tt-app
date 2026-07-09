import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ user: AuthUser | null; status: AuthStatus }>,
    ) {
      state.user = action.payload.user;
      state.status = action.payload.status;
      state.isAuthenticated = action.payload.status === "authenticated";
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "unauthenticated";
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
