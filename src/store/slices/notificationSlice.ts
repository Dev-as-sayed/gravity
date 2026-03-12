// src/store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  image?: string;
  data?: any;
  userId?: string;
  priority?: "low" | "medium" | "high";
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isDropdownOpen: boolean;
  preferences: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
    inApp: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isDropdownOpen: false,
  preferences: {
    sound: true,
    desktop: true,
    email: true,
    inApp: true,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(
        `/api/notifications?page=${page}&limit=${limit}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const clearAllNotifications = createAsyncThunk(
  "notification/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/notifications/clear-all", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updatePreferences = createAsyncThunk(
  "notification/updatePreferences",
  async (
    preferences: Partial<NotificationState["preferences"]>,
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
      return preferences;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Notification slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "createdAt" | "isRead">>,
    ) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isRead: false,
        ...action.payload,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;

      // Play sound if enabled
      if (state.preferences.sound) {
        // You can implement sound playing logic here
        // new Audio('/notification.mp3').play();
      }

      // Show desktop notification if enabled and supported
      if (
        state.preferences.desktop &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        if (Notification.permission === "granted") {
          new Notification(action.payload.title || "New Notification", {
            body: action.payload.message,
            icon: action.payload.image || "/logo.png",
          });
        }
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    toggleDropdown: (state) => {
      state.isDropdownOpen = !state.isDropdownOpen;
    },

    setDropdownOpen: (state, action: PayloadAction<boolean>) => {
      state.isDropdownOpen = action.payload;
    },

    updateNotificationPreferences: (
      state,
      action: PayloadAction<Partial<NotificationState["preferences"]>>,
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    resetNotifications: () => initialState,

    markAsReadLocally: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsReadLocally: (state) => {
      state.notifications.forEach((n) => {
        if (!n.isRead) {
          n.isRead = true;
          n.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload,
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          if (!n.isRead) {
            n.isRead = true;
            n.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload,
        );
        if (notification && !notification.isRead) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload,
        );
      })

      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })

      // Update preferences
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      });
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  toggleDropdown,
  setDropdownOpen,
  updateNotificationPreferences,
  resetNotifications,
  markAsReadLocally,
  markAllAsReadLocally,
  setLoading,
  setError,
} = notificationSlice.actions;

// Selectors
export const selectAllNotifications = (state: {
  notification: NotificationState;
}) => state.notification.notifications;
export const selectUnreadCount = (state: { notification: NotificationState }) =>
  state.notification.unreadCount;
export const selectNotificationLoading = (state: {
  notification: NotificationState;
}) => state.notification.isLoading;
export const selectNotificationError = (state: {
  notification: NotificationState;
}) => state.notification.error;
export const selectIsDropdownOpen = (state: {
  notification: NotificationState;
}) => state.notification.isDropdownOpen;
export const selectNotificationPreferences = (state: {
  notification: NotificationState;
}) => state.notification.preferences;
export const selectRecentNotifications =
  (limit: number = 5) =>
  (state: { notification: NotificationState }) =>
    state.notification.notifications.slice(0, limit);
export const selectUnreadNotifications = (state: {
  notification: NotificationState;
}) => state.notification.notifications.filter((n) => !n.isRead);
export const selectHasMoreNotifications = (state: {
  notification: NotificationState;
}) => state.notification.pagination.hasMore;

export default notificationSlice.reducer;
