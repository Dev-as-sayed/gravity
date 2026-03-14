// src/store/api/examApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Exam {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  teacherId: string;
  batchId?: string | null;
  type: string;
  subject: string;
  fullMarks: number;
  passMarks?: number | null;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  lateEntryAllowed: boolean;
  earlyExitAllowed: boolean;
  gradingType: string;
  isResultPublished: boolean;
  resultDate?: string | null;
  questionPaper?: string | null;
  answerSheet?: string | null;
  instructions?: string | null;
  allowReview: boolean;
  showRank: boolean;
  showPercentile: boolean;
  allowRecheck: boolean;
  recheckFee?: number | null;
  status:
    | "DRAFT"
    | "SCHEDULED"
    | "ONGOING"
    | "COMPLETED"
    | "RESULT_PUBLISHED"
    | "ARCHIVED"
    | "CANCELLED";
  totalStudents: number;
  appearedCount: number;
  passedCount: number;
  averageMarks: number;
  highestMarks: number;
  createdAt: string;
  updatedAt: string;

  // Relations
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
  results?: ExamResult[];
  _count?: {
    results: number;
  };
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string | null;
  rank?: number | null;
  percentile?: number | null;
  position?: string | null;
  subjectWiseMarks?: any;
  topicWiseMarks?: any;
  answerScript?: string | null;
  answerScriptUrl?: string | null;
  reviewedBy?: string | null;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  remarks?: string | null;
  recheckRequested: boolean;
  recheckApproved: boolean;
  recheckResult?: any;
  recheckFee?: number | null;
  recheckPaid: boolean;
  sentToGuardian: boolean;
  guardianSentAt?: string | null;
  certificateId?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    class?: string | null;
    rollNumber?: string | null;
  };
  exam?: {
    title: string;
    subject: string;
    fullMarks: number;
    passMarks?: number | null;
  };
}

export interface ExamFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  type?: string;
  status?: string;
  teacherId?: string;
  batchId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "examDate" | "title" | "createdAt" | "totalStudents";
  sortOrder?: "asc" | "desc";
}

export interface CreateExamData {
  title: string;
  slug?: string;
  description?: string;
  teacherId?: string;
  batchId?: string;
  type: string;
  subject: string;
  fullMarks: number;
  passMarks?: number;
  examDate: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  lateEntryAllowed?: boolean;
  earlyExitAllowed?: boolean;
  gradingType?: string;
  questionPaper?: string;
  answerSheet?: string;
  instructions?: string;
  allowReview?: boolean;
  showRank?: boolean;
  showPercentile?: boolean;
  allowRecheck?: boolean;
  recheckFee?: number;
  status?: string;
}

export interface UpdateExamData extends Partial<CreateExamData> {}

export interface CreateExamResultData {
  studentId: string;
  obtainedMarks: number;
  grade?: string;
  subjectWiseMarks?: any;
  topicWiseMarks?: any;
  feedback?: string;
  answerScript?: string;
}

export interface BulkExamResultData {
  results: CreateExamResultData[];
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

export interface ExamStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  draft: number;
  publishedResults: number;
  totalStudents: number;
  averageMarks: number;
  popularSubjects: Array<{ subject: string; _count: number }>;
  completionRate: number;
}

export interface UpdateExamStatusData {
  status: string;
  publishResults?: boolean;
}

export interface RecheckRequestData {
  reason: string;
}

// ==================== API ENDPOINTS ====================

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== EXAM QUERIES ====================

    /**
     * Get paginated list of exams with filters
     */
    getExams: builder.query<PaginatedResponse<Exam>, ExamFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/exams?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Exam" as const, id })),
              { type: "Exam", id: "LIST" },
            ]
          : [{ type: "Exam", id: "LIST" }],
    }),

    /**
     * Get single exam by ID
     */
    getExamById: builder.query<Exam, string>({
      query: (id) => `/exams/${id}`,
      providesTags: (result, error, id) => [{ type: "Exam", id }],
      transformResponse: (response: { data: Exam }) => response.data,
    }),

    /**
     * Get exam statistics
     */
    getExamStats: builder.query<{ data: ExamStats }, void>({
      query: () => "/exams/stats",
      providesTags: ["ExamStats"],
    }),

    // ==================== EXAM RESULT QUERIES ====================

    /**
     * Get exam results
     */
    getExamResults: builder.query<
      PaginatedResponse<ExamResult>,
      { examId: string; page?: number; limit?: number }
    >({
      query: ({ examId, page = 1, limit = 10 }) =>
        `/exams/${examId}/results?page=${page}&limit=${limit}`,
      providesTags: (result, error, { examId }) => [
        { type: "ExamResults", id: examId },
      ],
    }),

    /**
     * Get single exam result
     */
    getExamResultById: builder.query<
      ExamResult,
      { examId: string; resultId: string }
    >({
      query: ({ examId, resultId }) => `/exams/${examId}/results/${resultId}`,
      providesTags: (result, error, { resultId }) => [
        { type: "ExamResult", id: resultId },
      ],
      transformResponse: (response: { data: ExamResult }) => response.data,
    }),

    // ==================== EXAM MUTATIONS ====================

    /**
     * Create a new exam
     */
    createExam: builder.mutation<Exam, CreateExamData>({
      query: (data) => ({
        url: "/exams",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Exam", id: "LIST" }, "ExamStats"],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || "Failed to create exam",
        errors: response.data?.errors,
      }),
    }),

    /**
     * Update an existing exam
     */
    updateExam: builder.mutation<Exam, { id: string; data: UpdateExamData }>({
      query: ({ id, data }) => ({
        url: `/exams/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Exam", id },
        { type: "Exam", id: "LIST" },
        "ExamStats",
      ],
    }),

    /**
     * Delete an exam
     */
    deleteExam: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/exams/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Exam", id },
          { type: "Exam", id: "LIST" },
          "ExamStats",
        ],
      },
    ),

    /**
     * Update exam status
     */
    updateExamStatus: builder.mutation<
      Exam,
      { id: string; data: UpdateExamStatusData }
    >({
      query: ({ id, data }) => ({
        url: `/exams/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Exam", id },
        { type: "Exam", id: "LIST" },
        "ExamStats",
      ],
    }),

    /**
     * Publish exam results
     */
    publishExamResults: builder.mutation<Exam, string>({
      query: (id) => ({
        url: `/exams/${id}/status`,
        method: "PATCH",
        body: { status: "RESULT_PUBLISHED", publishResults: true },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Exam", id },
        { type: "Exam", id: "LIST" },
        "ExamStats",
        { type: "ExamResults", id },
      ],
    }),

    // ==================== EXAM RESULT MUTATIONS ====================

    /**
     * Add/Update exam results in bulk
     */
    saveExamResults: builder.mutation<
      ExamResult[],
      { examId: string; data: BulkExamResultData }
    >({
      query: ({ examId, data }) => ({
        url: `/exams/${examId}/results`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { examId }) => [
        { type: "Exam", id: examId },
        { type: "ExamResults", id: examId },
        "ExamStats",
      ],
    }),

    /**
     * Update a single exam result
     */
    updateExamResult: builder.mutation<
      ExamResult,
      { examId: string; resultId: string; data: Partial<CreateExamResultData> }
    >({
      query: ({ examId, resultId, data }) => ({
        url: `/exams/${examId}/results/${resultId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { examId, resultId }) => [
        { type: "Exam", id: examId },
        { type: "ExamResults", id: examId },
        { type: "ExamResult", id: resultId },
      ],
    }),

    /**
     * Request recheck for exam result
     */
    requestExamRecheck: builder.mutation<
      ExamResult,
      { examId: string; resultId: string; data: RecheckRequestData }
    >({
      query: ({ examId, resultId, data }) => ({
        url: `/exams/${examId}/results/${resultId}/recheck`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { examId, resultId }) => [
        { type: "Exam", id: examId },
        { type: "ExamResults", id: examId },
        { type: "ExamResult", id: resultId },
      ],
    }),

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk operations on exams
     */
    bulkExamAction: builder.mutation<
      { success: boolean; count: number },
      {
        examIds: string[];
        action: "publish" | "archive" | "delete" | "publishResults";
      }
    >({
      query: (data) => ({
        url: "/exams/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Exam", id: "LIST" }, "ExamStats"],
    }),
  }),
});

// ==================== HOOKS ====================

// Exam hooks
export const {
  useGetExamsQuery,
  useGetExamByIdQuery,
  useGetExamStatsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useUpdateExamStatusMutation,
  usePublishExamResultsMutation,
} = examApi;

// Exam Result hooks
export const {
  useGetExamResultsQuery,
  useGetExamResultByIdQuery,
  useSaveExamResultsMutation,
  useUpdateExamResultMutation,
  useRequestExamRecheckMutation,
} = examApi;

// Bulk operations hooks
export const { useBulkExamActionMutation } = examApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch exam data
 */
export const usePrefetchExam = () => {
  const api = examApi.usePrefetch("getExamById");
  return (id: string) => api(id);
};

/**
 * Hook to get exams with auto-refresh
 */
export const useExamsWithAutoRefresh = (filters: ExamFilters) => {
  return useGetExamsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get exam results with auto-refresh
 */
export const useExamResultsWithAutoRefresh = (
  examId: string,
  page = 1,
  limit = 10,
) => {
  return useGetExamResultsQuery(
    { examId, page, limit },
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
};
