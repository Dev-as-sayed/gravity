// src/store/api/moderatorApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Moderator {
  id: string;
  userId: string;
  name: string;
  assignedBy: string;
  permissions: any;
  lastActive?: string | null;
  actionsTaken: number;
  resolvedIssues: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: string;
    email: string;
    phone: string;
    alternatePhone?: string | null;
    isActive: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin?: string | null;
    createdAt: string;
  };
  batches?: Array<{
    id: string;
    name: string;
    subject: string;
    mode: string;
    teacher?: {
      id: string;
      name: string;
    };
    course?: {
      id: string;
      title: string;
    };
    _count?: {
      enrollments: number;
      students: number;
    };
  }>;
  assigner?: {
    type: "TEACHER" | "ADMIN";
    id: string;
    name: string;
    email?: string;
    role?: string;
  } | null;
  _count?: {
    batches: number;
  };
}

export interface ModeratorFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  assignedBy?: string;
  hasBatches?: boolean;
  sortBy?: "name" | "createdAt" | "actionsTaken" | "resolvedIssues";
  sortOrder?: "asc" | "desc";
}

export interface CreateModeratorData {
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  name: string;
  assignedBy?: string;
  permissions?: any;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profileImage?: string;
}

export interface UpdateModeratorData extends Partial<CreateModeratorData> {
  isActive?: boolean;
}

export interface BulkActionData {
  moderatorIds: string[];
  action: "activate" | "deactivate" | "delete" | "assignBatches";
  batchIds?: string[];
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

export interface ModeratorStats {
  total: number;
  active: number;
  inactive: number;
  withBatches: number;
  withoutBatches: number;
  topModerators: Array<{
    id: string;
    name: string;
    actionsTaken: number;
    resolvedIssues: number;
    _count: { batches: number };
    user: { email: string };
  }>;
  recentRegistrations: number;
  assignmentStats: Array<{ assignedBy: string; _count: number }>;
  coverageRate: number;
  completionRate: number;
}

export interface ModeratorActivity {
  moderator: {
    id: string;
    name: string;
    lastActive?: string | null;
    actionsTaken: number;
    resolvedIssues: number;
    lastLogin?: string | null;
  };
  recentActivity: any[];
  moderationActions: any[];
  activitySummary: {
    totalActions: number;
    totalResolved: number;
    resolutionRate: number;
  };
}

export interface BatchAssignmentData {
  moderatorId: string;
  batchIds: string[];
}

// ==================== API ENDPOINTS ====================

export const moderatorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get paginated list of moderators with advanced filtering
     */
    getModerators: builder.query<
      PaginatedResponse<Moderator>,
      ModeratorFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        return {
          url: `/moderators?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Moderator" as const,
                id,
              })),
              { type: "Moderator", id: "LIST" },
            ]
          : [{ type: "Moderator", id: "LIST" }],
    }),

    /**
     * Get single moderator by ID with complete profile data
     */
    getModeratorById: builder.query<Moderator, string>({
      query: (id) => `/moderators/${id}`,
      providesTags: (result, error, id) => [{ type: "Moderator", id }],
      transformResponse: (response: { data: Moderator }) => response.data,
    }),

    /**
     * Get moderator statistics
     */
    getModeratorStats: builder.query<{ data: ModeratorStats }, void>({
      query: () => "/moderators/stats",
      providesTags: ["ModeratorStats"],
    }),

    /**
     * Get batches assigned to moderator
     */
    getModeratorBatches: builder.query<any[], string>({
      query: (id) => `/moderators/${id}/batches`,
      providesTags: (result, error, id) => [{ type: "ModeratorBatches", id }],
      transformResponse: (response: { data: any[] }) => response.data,
    }),

    /**
     * Get moderator activity
     */
    getModeratorActivity: builder.query<{ data: ModeratorActivity }, string>({
      query: (id) => `/moderators/${id}/activity`,
      providesTags: (result, error, id) => [{ type: "ModeratorActivity", id }],
    }),

    // ==================== MUTATIONS ====================

    /**
     * Create a new moderator
     */
    createModerator: builder.mutation<Moderator, CreateModeratorData>({
      query: (data) => ({
        url: "/moderators",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Moderator", id: "LIST" }, "ModeratorStats"],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || "Failed to create moderator",
        errors: response.data?.errors,
      }),
    }),

    /**
     * Update an existing moderator
     */
    updateModerator: builder.mutation<
      Moderator,
      { id: string; data: UpdateModeratorData }
    >({
      query: ({ id, data }) => ({
        url: `/moderators/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Moderator", id },
        { type: "Moderator", id: "LIST" },
        "ModeratorStats",
      ],
    }),

    /**
     * Delete a moderator
     */
    deleteModerator: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/moderators/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Moderator", id },
        { type: "Moderator", id: "LIST" },
        "ModeratorStats",
      ],
    }),

    /**
     * Toggle moderator active status
     */
    toggleModeratorStatus: builder.mutation<
      { moderatorId: string; userId: string; isActive: boolean },
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/moderators/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Moderator", id },
        { type: "Moderator", id: "LIST" },
        "ModeratorStats",
      ],
    }),

    /**
     * Bulk operations on moderators
     */
    bulkModeratorAction: builder.mutation<
      { success: boolean; count: number },
      BulkActionData
    >({
      query: (data) => ({
        url: "/moderators/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Moderator", id: "LIST" }, "ModeratorStats"],
    }),

    /**
     * Assign batches to moderator
     */
    assignBatchesToModerator: builder.mutation<any[], BatchAssignmentData>({
      query: ({ moderatorId, batchIds }) => ({
        url: `/moderators/${moderatorId}/batches`,
        method: "POST",
        body: { batchIds },
      }),
      invalidatesTags: (result, error, { moderatorId }) => [
        { type: "Moderator", id: moderatorId },
        { type: "ModeratorBatches", id: moderatorId },
      ],
    }),

    /**
     * Remove batches from moderator
     */
    removeBatchesFromModerator: builder.mutation<any[], BatchAssignmentData>({
      query: ({ moderatorId, batchIds }) => ({
        url: `/moderators/${moderatorId}/batches`,
        method: "DELETE",
        body: { batchIds },
      }),
      invalidatesTags: (result, error, { moderatorId }) => [
        { type: "Moderator", id: moderatorId },
        { type: "ModeratorBatches", id: moderatorId },
      ],
    }),

    /**
     * Update moderator activity
     */
    updateModeratorActivity: builder.mutation<
      Moderator,
      { id: string; incrementActions?: number; incrementResolved?: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/moderators/${id}/activity`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Moderator", id },
        { type: "ModeratorActivity", id },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

// Queries
export const {
  useGetModeratorsQuery,
  useGetModeratorByIdQuery,
  useGetModeratorStatsQuery,
  useGetModeratorBatchesQuery,
  useGetModeratorActivityQuery,
} = moderatorApi;

// Mutations
export const {
  useCreateModeratorMutation,
  useUpdateModeratorMutation,
  useDeleteModeratorMutation,
  useToggleModeratorStatusMutation,
  useBulkModeratorActionMutation,
  useAssignBatchesToModeratorMutation,
  useRemoveBatchesFromModeratorMutation,
  useUpdateModeratorActivityMutation,
} = moderatorApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch moderator data
 */
export const usePrefetchModerator = () => {
  const api = moderatorApi.usePrefetch("getModeratorById");
  return (id: string) => api(id);
};

/**
 * Hook to get moderators with auto-refresh
 */
export const useModeratorsWithAutoRefresh = (filters: ModeratorFilters) => {
  return useGetModeratorsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
