// src/store/api/notificationApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Notification {
  id: string;
  userId: string;
  type: "success" | "error" | "info" | "warning";
  channel?: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  title?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export interface NotificationPreferences {
  sound: boolean;
  desktop: boolean;
  email: boolean;
  inApp: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ==================== API ENDPOINTS ====================

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getNotifications: builder.query<PaginatedResponse<Notification>, NotificationFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/notifications?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Notification" as const, id })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    getNotificationPreferences: builder.query<{ data: NotificationPreferences }, void>({
      query: () => "/notifications/preferences",
      providesTags: ["NotificationPreference"],
    }),

    // ==================== MUTATIONS ====================

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    clearAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    updateNotificationPreferences: builder.mutation<NotificationPreferences, Partial<NotificationPreferences>>({
      query: (data) => ({
        url: "/notifications/preferences",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["NotificationPreference"],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetNotificationsQuery,
  useGetNotificationPreferencesQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearAllNotificationsMutation,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;
