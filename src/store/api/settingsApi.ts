// src/store/api/settingsApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface UserSettings {
  id: string;
  userId: string;
  language?: string;
  timezone?: string;
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  twoFactorEnabled?: boolean;
  preferredContactMethod?: "EMAIL" | "PHONE" | "SMS";
  weeklyDigest?: boolean;
  marketingEmails?: boolean;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData extends Partial<Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt">> {}

// ==================== API ENDPOINTS ====================

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getSettings: builder.query<UserSettings, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
      transformResponse: (response: { data: UserSettings }) => response.data,
    }),

    // ==================== MUTATIONS ====================

    updateSettings: builder.mutation<UserSettings, UpdateSettingsData>({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to update settings",
        errors: response?.data?.errors || [],
      }),
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi;
