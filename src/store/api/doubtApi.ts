// src/store/api/doubtApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Doubt {
  id: string;
  title: string;
  description?: string | null;
  studentId: string;
  batchId?: string | null;
  subject?: string | null;
  topic?: string | null;
  questionId?: string | null;
  images: string[];
  files?: any;
  status: "OPEN" | "ANSWERED" | "RESOLVED" | "CLOSED" | "ESCALATED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  assignedTo?: string | null;
  assignedAt?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  satisfactionRating?: number | null;
  feedback?: string | null;
  viewCount: number;
  upvoteCount: number;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
    profileImage?: string | null;
  };
  batch?: {
    id: string;
    name: string;
    subject: string;
  };
  answers?: DoubtAnswer[];
  _count?: {
    answers: number;
  };
}

export interface DoubtAnswer {
  id: string;
  doubtId: string;
  teacherId?: string | null;
  studentId?: string | null;
  content: string;
  images: string[];
  files?: any;
  isAccepted: boolean;
  isOfficial: boolean;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
  };
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

export interface DoubtFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  subject?: string;
  search?: string;
  assignedTo?: string;
  sortBy?: "createdAt" | "updatedAt" | "viewCount" | "upvoteCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateDoubtData {
  title: string;
  description?: string;
  batchId?: string;
  subject?: string;
  topic?: string;
  questionId?: string;
  images?: string[];
  files?: any;
  priority?: string;
  tags?: string[];
  isPrivate?: boolean;
}

export interface UpdateDoubtData extends Partial<CreateDoubtData> {}

export interface CreateAnswerData {
  content: string;
  images?: string[];
  files?: any;
}

export interface UpdateAnswerData extends Partial<CreateAnswerData> {}

export interface AssignTeacherData {
  teacherId: string;
}

export interface ResolveDoubtData {
  rating?: number;
  feedback?: string;
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

export interface DoubtStats {
  total: number;
  open: number;
  answered: number;
  resolved: number;
  avgResponseTime: number;
  popularSubjects: Array<{ subject: string; _count: number }>;
  topTeachers: Array<{ assignedTo: string; _count: number }>;
  resolutionRate: number;
}

// ==================== API ENDPOINTS ====================

export const doubtApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== DOUBT QUERIES ====================

    /**
     * Get paginated list of doubts with filters
     */
    getDoubts: builder.query<PaginatedResponse<Doubt>, DoubtFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/doubts?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Doubt" as const, id })),
              { type: "Doubt", id: "LIST" },
            ]
          : [{ type: "Doubt", id: "LIST" }],
    }),

    /**
     * Get single doubt by ID
     */
    getDoubtById: builder.query<Doubt, string>({
      query: (id) => `/doubts/${id}`,
      providesTags: (result, error, id) => [{ type: "Doubt", id }],
      transformResponse: (response: { data: Doubt }) => response.data,
    }),

    /**
     * Get doubt statistics
     */
    getDoubtStats: builder.query<{ data: DoubtStats }, void>({
      query: () => "/doubts/stats",
      providesTags: ["DoubtStats"],
    }),

    // ==================== ANSWER QUERIES ====================

    /**
     * Get all answers for a doubt
     */
    getDoubtAnswers: builder.query<DoubtAnswer[], string>({
      query: (doubtId) => `/doubts/${doubtId}/answers`,
      providesTags: (result, error, doubtId) => [
        { type: "DoubtAnswers", id: doubtId },
      ],
      transformResponse: (response: { data: DoubtAnswer[] }) => response.data,
    }),

    /**
     * Get single answer
     */
    getDoubtAnswerById: builder.query<
      DoubtAnswer,
      { doubtId: string; answerId: string }
    >({
      query: ({ doubtId, answerId }) =>
        `/doubts/${doubtId}/answers/${answerId}`,
      providesTags: (result, error, { answerId }) => [
        { type: "DoubtAnswer", id: answerId },
      ],
      transformResponse: (response: { data: DoubtAnswer }) => response.data,
    }),

    // ==================== DOUBT MUTATIONS ====================

    /**
     * Create a new doubt
     */
    createDoubt: builder.mutation<Doubt, CreateDoubtData>({
      query: (data) => ({
        url: "/doubts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Doubt", id: "LIST" }, "DoubtStats"],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || "Failed to create doubt",
        errors: response.data?.errors,
      }),
    }),

    /**
     * Update an existing doubt
     */
    updateDoubt: builder.mutation<Doubt, { id: string; data: UpdateDoubtData }>(
      {
        query: ({ id, data }) => ({
          url: `/doubts/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Doubt", id },
          { type: "Doubt", id: "LIST" },
          "DoubtStats",
        ],
      },
    ),

    /**
     * Delete a doubt
     */
    deleteDoubt: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/doubts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Doubt", id },
        { type: "Doubt", id: "LIST" },
        "DoubtStats",
      ],
    }),

    /**
     * Upvote a doubt
     */
    upvoteDoubt: builder.mutation<Doubt, string>({
      query: (id) => ({
        url: `/doubts/${id}/upvote`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Doubt", id }],
    }),

    // ==================== ASSIGNMENT MUTATIONS ====================

    /**
     * Assign teacher to doubt
     */
    assignTeacher: builder.mutation<
      Doubt,
      { id: string; data: AssignTeacherData }
    >({
      query: ({ id, data }) => ({
        url: `/doubts/${id}/assign`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Doubt", id },
        { type: "Doubt", id: "LIST" },
        "DoubtStats",
      ],
    }),

    /**
     * Resolve doubt
     */
    resolveDoubt: builder.mutation<
      Doubt,
      { id: string; data?: ResolveDoubtData }
    >({
      query: ({ id, data }) => ({
        url: `/doubts/${id}/resolve`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Doubt", id },
        { type: "Doubt", id: "LIST" },
        "DoubtStats",
      ],
    }),

    // ==================== ANSWER MUTATIONS ====================

    /**
     * Add answer to doubt
     */
    addAnswer: builder.mutation<
      DoubtAnswer,
      { doubtId: string; data: CreateAnswerData }
    >({
      query: ({ doubtId, data }) => ({
        url: `/doubts/${doubtId}/answers`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { doubtId }) => [
        { type: "Doubt", id: doubtId },
        { type: "DoubtAnswers", id: doubtId },
        "DoubtStats",
      ],
    }),

    /**
     * Update an answer
     */
    updateAnswer: builder.mutation<
      DoubtAnswer,
      { doubtId: string; answerId: string; data: UpdateAnswerData }
    >({
      query: ({ doubtId, answerId, data }) => ({
        url: `/doubts/${doubtId}/answers/${answerId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { doubtId, answerId }) => [
        { type: "Doubt", id: doubtId },
        { type: "DoubtAnswers", id: doubtId },
        { type: "DoubtAnswer", id: answerId },
      ],
    }),

    /**
     * Delete an answer
     */
    deleteAnswer: builder.mutation<
      { success: boolean; message: string },
      { doubtId: string; answerId: string }
    >({
      query: ({ doubtId, answerId }) => ({
        url: `/doubts/${doubtId}/answers/${answerId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { doubtId, answerId }) => [
        { type: "Doubt", id: doubtId },
        { type: "DoubtAnswers", id: doubtId },
        { type: "DoubtAnswer", id: answerId },
      ],
    }),

    /**
     * Accept an answer as the solution
     */
    acceptAnswer: builder.mutation<
      DoubtAnswer,
      { doubtId: string; answerId: string }
    >({
      query: ({ doubtId, answerId }) => ({
        url: `/doubts/${doubtId}/answers/${answerId}/accept`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { doubtId, answerId }) => [
        { type: "Doubt", id: doubtId },
        { type: "DoubtAnswers", id: doubtId },
        { type: "DoubtAnswer", id: answerId },
        "DoubtStats",
      ],
    }),

    /**
     * Upvote an answer
     */
    upvoteAnswer: builder.mutation<
      DoubtAnswer,
      { doubtId: string; answerId: string }
    >({
      query: ({ doubtId, answerId }) => ({
        url: `/doubts/${doubtId}/answers/${answerId}/upvote`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { doubtId, answerId }) => [
        { type: "Doubt", id: doubtId },
        { type: "DoubtAnswers", id: doubtId },
        { type: "DoubtAnswer", id: answerId },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

// Doubt hooks
export const {
  useGetDoubtsQuery,
  useGetDoubtByIdQuery,
  useGetDoubtStatsQuery,
  useCreateDoubtMutation,
  useUpdateDoubtMutation,
  useDeleteDoubtMutation,
  useUpvoteDoubtMutation,
} = doubtApi;

// Assignment hooks
export const { useAssignTeacherMutation, useResolveDoubtMutation } = doubtApi;

// Answer hooks
export const {
  useGetDoubtAnswersQuery,
  useGetDoubtAnswerByIdQuery,
  useAddAnswerMutation,
  useUpdateAnswerMutation,
  useDeleteAnswerMutation,
  useAcceptAnswerMutation,
  useUpvoteAnswerMutation,
} = doubtApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch doubt data
 */
export const usePrefetchDoubt = () => {
  const api = doubtApi.usePrefetch("getDoubtById");
  return (id: string) => api(id);
};

/**
 * Hook to get doubts with auto-refresh
 */
export const useDoubtsWithAutoRefresh = (filters: DoubtFilters) => {
  return useGetDoubtsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get doubt answers with auto-refresh
 */
export const useDoubtAnswersWithAutoRefresh = (doubtId: string) => {
  return useGetDoubtAnswersQuery(doubtId, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
