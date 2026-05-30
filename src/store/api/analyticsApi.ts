// src/store/api/analyticsApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface DashboardAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalBatches: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    userId: string;
    userName: string;
    createdAt: string;
  }>;
}

// ==================== API ENDPOINTS ====================

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getDashboardAnalytics: builder.query<{ data: DashboardAnalytics }, void>({
      query: () => "/analytics",
      providesTags: ["Analytics"],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetDashboardAnalyticsQuery,
} = analyticsApi;
