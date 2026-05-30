// src/store/api/profileApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  phone: string;
  name: string;
  profileImage?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  role: "STUDENT" | "TEACHER" | "MODERATOR" | "ADMIN" | "GUARDIAN";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Role-specific data
  student?: Record<string, any> | null;
  teacher?: Record<string, any> | null;
  guardian?: Record<string, any> | null;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  phone?: string;
}

// ==================== API ENDPOINTS ====================

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getProfile: builder.query<UserProfile, void>({
      query: () => "/profile",
      providesTags: ["Profile"],
      transformResponse: (response: { data: UserProfile }) => response.data,
    }),

    // ==================== MUTATIONS ====================

    updateProfile: builder.mutation<UserProfile, UpdateProfileData>({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Profile"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to update profile",
        errors: response?.data?.errors || [],
      }),
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
} = profileApi;
