// src/store/api/guardianApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Guardian {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  occupation?: string | null;
  income?: number | null;
  notificationPrefs?: any;
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
  students?: Array<{
    id: string;
    name: string;
    class?: string | null;
    institute?: string | null;
    user?: {
      email: string;
      phone: string;
    };
  }>;
  _count?: {
    students: number;
    comments: number;
    postReactions: number;
    postBookmarks: number;
    pollVotes: number;
  };
}

export interface GuardianFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  relationship?: string;
  hasStudents?: boolean;
  sortBy?: "name" | "createdAt" | "relationship";
  sortOrder?: "asc" | "desc";
}

export interface CreateGuardianData {
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  name: string;
  relationship: string;
  occupation?: string;
  income?: number;
  notificationPrefs?: any;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateGuardianData extends Partial<CreateGuardianData> {
  isActive?: boolean;
}

export interface BulkActionData {
  guardianIds: string[];
  action: "activate" | "deactivate" | "delete";
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

export interface GuardianStats {
  total: number;
  active: number;
  inactive: number;
  byRelationship: Array<{ relationship: string; _count: number }>;
  withStudents: number;
  withoutStudents: number;
  topGuardians: Array<{
    id: string;
    name: string;
    relationship: string;
    _count: { students: number };
    user: { email: string };
  }>;
  recentRegistrations: number;
  coverageRate: number;
  completionRate: number;
}

export interface StudentAssignmentData {
  guardianId: string;
  studentIds: string[];
}

// ==================== API ENDPOINTS ====================

export const guardianApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get paginated list of guardians with advanced filtering
     */
    getGuardians: builder.query<PaginatedResponse<Guardian>, GuardianFilters>({
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
          url: `/guardians?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Guardian" as const,
                id,
              })),
              { type: "Guardian", id: "LIST" },
            ]
          : [{ type: "Guardian", id: "LIST" }],
    }),

    /**
     * Get single guardian by ID with complete profile data
     */
    getGuardianById: builder.query<Guardian, string>({
      query: (id) => `/guardians/${id}`,
      providesTags: (result, error, id) => [{ type: "Guardian", id }],
      transformResponse: (response: { data: Guardian }) => response.data,
    }),

    /**
     * Get guardian statistics
     */
    getGuardianStats: builder.query<{ data: GuardianStats }, void>({
      query: () => "/guardians/stats",
      providesTags: ["GuardianStats"],
    }),

    /**
     * Get students associated with a guardian
     */
    getGuardianStudents: builder.query<any[], string>({
      query: (id) => `/guardians/${id}/students`,
      providesTags: (result, error, id) => [{ type: "GuardianStudents", id }],
      transformResponse: (response: { data: any[] }) => response.data,
    }),

    /**
     * Get guardian notification preferences
     */
    getGuardianPreferences: builder.query<any, string>({
      query: (id) => `/guardians/${id}/preferences`,
      providesTags: (result, error, id) => [
        { type: "GuardianPreferences", id },
      ],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // ==================== MUTATIONS ====================

    /**
     * Create a new guardian
     */
    createGuardian: builder.mutation<Guardian, CreateGuardianData>({
      query: (data) => ({
        url: "/guardians",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Guardian", id: "LIST" }, "GuardianStats"],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || "Failed to create guardian",
        errors: response.data?.errors,
      }),
    }),

    /**
     * Update an existing guardian
     */
    updateGuardian: builder.mutation<
      Guardian,
      { id: string; data: UpdateGuardianData }
    >({
      query: ({ id, data }) => ({
        url: `/guardians/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Guardian", id },
        { type: "Guardian", id: "LIST" },
        "GuardianStats",
      ],
    }),

    /**
     * Delete a guardian
     */
    deleteGuardian: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/guardians/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Guardian", id },
        { type: "Guardian", id: "LIST" },
        "GuardianStats",
      ],
    }),

    /**
     * Toggle guardian active status
     */
    toggleGuardianStatus: builder.mutation<
      { guardianId: string; userId: string; isActive: boolean },
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/guardians/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Guardian", id },
        { type: "Guardian", id: "LIST" },
        "GuardianStats",
      ],
    }),

    /**
     * Bulk operations on guardians
     */
    bulkGuardianAction: builder.mutation<
      { success: boolean; count: number },
      BulkActionData
    >({
      query: (data) => ({
        url: "/guardians/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Guardian", id: "LIST" }, "GuardianStats"],
    }),

    /**
     * Add students to guardian
     */
    addStudentsToGuardian: builder.mutation<
      { success: boolean; count: number },
      StudentAssignmentData
    >({
      query: ({ guardianId, studentIds }) => ({
        url: `/guardians/${guardianId}/students`,
        method: "POST",
        body: { studentIds },
      }),
      invalidatesTags: (result, error, { guardianId }) => [
        { type: "Guardian", id: guardianId },
        { type: "GuardianStudents", id: guardianId },
      ],
    }),

    /**
     * Remove students from guardian
     */
    removeStudentsFromGuardian: builder.mutation<
      { success: boolean; count: number },
      StudentAssignmentData
    >({
      query: ({ guardianId, studentIds }) => ({
        url: `/guardians/${guardianId}/students`,
        method: "DELETE",
        body: { studentIds },
      }),
      invalidatesTags: (result, error, { guardianId }) => [
        { type: "Guardian", id: guardianId },
        { type: "GuardianStudents", id: guardianId },
      ],
    }),

    /**
     * Update guardian notification preferences
     */
    updateGuardianPreferences: builder.mutation<
      any,
      { id: string; preferences: any }
    >({
      query: ({ id, preferences }) => ({
        url: `/guardians/${id}/preferences`,
        method: "PUT",
        body: preferences,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Guardian", id },
        { type: "GuardianPreferences", id },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

// Queries
export const {
  useGetGuardiansQuery,
  useGetGuardianByIdQuery,
  useGetGuardianStatsQuery,
  useGetGuardianStudentsQuery,
  useGetGuardianPreferencesQuery,
} = guardianApi;

// Mutations
export const {
  useCreateGuardianMutation,
  useUpdateGuardianMutation,
  useDeleteGuardianMutation,
  useToggleGuardianStatusMutation,
  useBulkGuardianActionMutation,
  useAddStudentsToGuardianMutation,
  useRemoveStudentsFromGuardianMutation,
  useUpdateGuardianPreferencesMutation,
} = guardianApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch guardian data
 */
export const usePrefetchGuardian = () => {
  const api = guardianApi.usePrefetch("getGuardianById");
  return (id: string) => api(id);
};

/**
 * Hook to get guardians with auto-refresh
 */
export const useGuardiansWithAutoRefresh = (filters: GuardianFilters) => {
  return useGetGuardiansQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
