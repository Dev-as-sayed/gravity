// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { signIn, signOut } from "next-auth/react";

// Types
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone?: string | null;
  profileImage?: string | null;
  teacherId?: string | null;
  studentId?: string | null;
  guardianId?: string | null;
  moderatorId?: string | null;
  adminId?: string | null;
  isVerified?: boolean;
  lastLogin?: string;
}

interface Permission {
  resource: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  sessionExpiry: number | null;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: number | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  permissions: [],
  sessionExpiry: null,
  loginAttempts: 0,
  isLocked: false,
  lockUntil: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Track failed login attempts
        dispatch(incrementLoginAttempts());
        return rejectWithValue(result.error);
      }

      // Fetch user session after successful login
      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();

      if (!session?.user) {
        return rejectWithValue("Failed to fetch user session");
      }

      // Reset login attempts on successful login
      dispatch(resetLoginAttempts());

      return session.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await signOut({ redirect: false });
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  },
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      return session?.user || null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to refresh session");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Profile update failed");
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || "Password change failed");
    }
  },
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        // Set session expiry to 24 hours from now
        state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
      }
    },
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      // Lock after 5 failed attempts
      if (state.loginAttempts >= 5) {
        state.isLocked = true;
        state.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockUntil = null;
    },
    unlockAccount: (state) => {
      state.isLocked = false;
      state.lockUntil = null;
      state.loginAttempts = 0;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    refreshToken: (state) => {
      // Extend session expiry
      state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
    },
    checkSession: (state) => {
      if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
        // Session expired
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return { ...initialState };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh session
      .addCase(refreshSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.sessionExpiry = null;
        }
      })
      .addCase(refreshSession.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
      })

      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })

      // Change password
      .addCase(changePassword.fulfilled, (state) => {
        // Password changed successfully
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setPermissions,
  clearError,
  incrementLoginAttempts,
  resetLoginAttempts,
  unlockAccount,
  updateUser,
  refreshToken,
  checkSession,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.role;
export const selectHasPermission =
  (resource: string, action: string) => (state: { auth: AuthState }) => {
    const permission = state.auth.permissions.find(
      (p) => p.resource === resource,
    );
    return permission?.actions.includes(action) || false;
  };
export const selectIsLocked = (state: { auth: AuthState }) => {
  if (state.auth.isLocked && state.auth.lockUntil) {
    return Date.now() < state.auth.lockUntil;
  }
  return false;
};

export default authSlice.reducer;
