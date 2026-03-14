// src/store/api/quizApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "MATCHING";
  options?: any;
  correctAnswer: any;
  explanation?: string | null;
  marks: number;
  negativeMarks: number;
  matchPairs?: any;
  imageUrl?: string | null;
  audioUrl?: string | null;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  topic?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  teacherId: string;
  batchId?: string | null;
  timeLimit?: number | null;
  totalMarks: number;
  passingMarks?: number | null;
  negativeMarking: number;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  startTime?: string | null;
  endTime?: string | null;
  isActive: boolean;
  showResult: boolean;
  showAnswer: boolean;
  showExplanation: boolean;
  showLeaderboard: boolean;
  allowRetake: boolean;
  maxAttempts: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  subject?: string | null;
  topics: string[];
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  passRate: number;
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
  questions?: Question[];
  _count?: {
    questions: number;
    attempts: number;
    quizResults: number;
  };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  startTime: string;
  endTime?: string | null;
  answers?: any;
  score?: number | null;
  percentage?: number | null;
  isPassed?: boolean | null;
  questionWiseAnalysis?: any;
  timeSpent?: number | null;
  sectionWiseScore?: any;
  autoGraded: boolean;
  isCompleted: boolean;
  feedback?: string | null;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  quiz?: Quiz;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  quizResult?: QuizResult;
}

export interface QuizResult {
  id: string;
  attemptId: string;
  studentId: string;
  quizId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  rank?: number | null;
  totalParticipants?: number | null;
  weakTopics: string[];
  strongTopics: string[];
  timeAnalysis?: any;
  feedback?: string | null;
  recommendations: string[];
  certificateId?: string | null;
  createdAt: string;

  // Relations
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  quiz?: Quiz;
  attempt?: QuizAttempt;
  certificate?: any;
}

export interface QuizFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
  teacherId?: string;
  batchId?: string;
  sortBy?: "title" | "createdAt" | "totalAttempts" | "averageScore";
  sortOrder?: "asc" | "desc";
}

export interface CreateQuizData {
  title: string;
  slug?: string;
  description?: string;
  teacherId?: string;
  batchId?: string;
  timeLimit?: number;
  totalMarks: number;
  passingMarks?: number;
  negativeMarking?: number;
  status?: string;
  difficulty?: string;
  subject?: string;
  topics?: string[];
  showResult?: boolean;
  showAnswer?: boolean;
  showExplanation?: boolean;
  showLeaderboard?: boolean;
  allowRetake?: boolean;
  maxAttempts?: number;
  startTime?: string;
  endTime?: string;
}

export interface UpdateQuizData extends Partial<CreateQuizData> {}

export interface CreateQuestionData {
  text: string;
  type: string;
  options?: any;
  correctAnswer: any;
  explanation?: string;
  marks?: number;
  negativeMarks?: number;
  matchPairs?: any;
  imageUrl?: string;
  audioUrl?: string;
  difficulty?: string;
  topic?: string;
  order?: number;
}

export interface SubmitQuizData {
  answers: Array<{
    questionId: string;
    selectedOption?: number;
    selectedValue?: any;
    matchedPairs?: any;
    text?: string;
  }>;
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

export interface QuizStats {
  total: number;
  published: number;
  draft: number;
  attempts: number;
  averageScore: number;
  popularSubjects: Array<{ subject: string; _count: number }>;
  difficultyDistribution: Array<{ difficulty: string; _count: number }>;
  completionRate: number;
}

export interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  questionAnalysis: Array<{
    id: string;
    text: string;
    attempt_count: number;
    correct_rate: number;
  }>;
  timeAnalysis: {
    avg_time_seconds: number;
    min_time_seconds: number;
    max_time_seconds: number;
  };
}

// ==================== API ENDPOINTS ====================

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUIZ QUERIES ====================

    /**
     * Get paginated list of quizzes with filters
     */
    getQuizzes: builder.query<PaginatedResponse<Quiz>, QuizFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/quizzes?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Quiz" as const, id })),
              { type: "Quiz", id: "LIST" },
            ]
          : [{ type: "Quiz", id: "LIST" }],
    }),

    /**
     * Get single quiz by ID
     */
    getQuizById: builder.query<Quiz, string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: "Quiz", id }],
      transformResponse: (response: { data: Quiz }) => response.data,
    }),

    /**
     * Get quiz statistics
     */
    getQuizStats: builder.query<{ data: QuizStats }, void>({
      query: () => "/quizzes/stats",
      providesTags: ["QuizStats"],
    }),

    /**
     * Get quiz analytics
     */
    getQuizAnalytics: builder.query<{ data: QuizAnalytics }, string>({
      query: (id) => `/quizzes/${id}/analytics`,
      providesTags: (result, error, id) => [{ type: "QuizAnalytics", id }],
    }),

    // ==================== QUESTION QUERIES ====================

    /**
     * Get all questions for a quiz
     */

    // src\app\api\quizzes\quizId\[quizId]\questions\[questionId]\route.ts
    getQuizQuestions: builder.query<Question[], string>({
      query: (quizId) => `/quizzes/quizId/${quizId}/questions`,
      providesTags: (result, error, quizId) => [
        { type: "QuizQuestions", id: quizId },
      ],
      transformResponse: (response: { data: Question[] }) => response.data,
    }),

    // ==================== ATTEMPT QUERIES ====================

    /**
     * Get student's attempts for a quiz
     */
    getQuizAttempts: builder.query<QuizAttempt[], string>({
      query: (quizId) => `/quizzes/quizId/${quizId}/attempt`,
      providesTags: (result, error, quizId) => [
        { type: "QuizAttempts", id: quizId },
      ],
      transformResponse: (response: { data: QuizAttempt[] }) => response.data,
    }),

    /**
     * Get quiz results
     */
    getQuizResults: builder.query<
      PaginatedResponse<QuizResult>,
      { quizId: string; page?: number; limit?: number }
    >({
      query: ({ quizId, page = 1, limit = 10 }) =>
        `/quizzes/quizId/${quizId}/results?page=${page}&limit=${limit}`,
      providesTags: (result, error, { quizId }) => [
        { type: "QuizResults", id: quizId },
      ],
    }),

    // ==================== QUIZ MUTATIONS ====================

    /**
     * Create a new quiz
     */
    createQuiz: builder.mutation<Quiz, CreateQuizData>({
      query: (data) => ({
        url: "/quizzes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Quiz", id: "LIST" }, "QuizStats"],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || "Failed to create quiz",
        errors: response.data?.errors,
      }),
    }),

    /**
     * Update an existing quiz
     */
    updateQuiz: builder.mutation<Quiz, { id: string; data: UpdateQuizData }>({
      query: ({ id, data }) => ({
        url: `/quizzes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Quiz", id },
        { type: "Quiz", id: "LIST" },
        "QuizStats",
      ],
    }),

    /**
     * Delete a quiz
     */
    deleteQuiz: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/quizzes/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Quiz", id },
          { type: "Quiz", id: "LIST" },
          "QuizStats",
        ],
      },
    ),

    /**
     * Publish a quiz
     */
    publishQuiz: builder.mutation<Quiz, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "PATCH",
        body: { status: "PUBLISHED" },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Quiz", id },
        { type: "Quiz", id: "LIST" },
        "QuizStats",
      ],
    }),

    /**
     * Archive a quiz
     */
    archiveQuiz: builder.mutation<Quiz, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "PATCH",
        body: { status: "ARCHIVED" },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Quiz", id },
        { type: "Quiz", id: "LIST" },
        "QuizStats",
      ],
    }),

    // ==================== QUESTION MUTATIONS ====================

    /**
     * Add a question to quiz
     */
    addQuestion: builder.mutation<
      Question,
      { quizId: string; data: CreateQuestionData }
    >({
      query: ({ quizId, data }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: "Quiz", id: quizId },
        { type: "QuizQuestions", id: quizId },
      ],
    }),

    /**
     * Add multiple questions to quiz
     */
    addBulkQuestions: builder.mutation<
      Question[],
      { quizId: string; data: CreateQuestionData[] }
    >({
      query: ({ quizId, data }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: "Quiz", id: quizId },
        { type: "QuizQuestions", id: quizId },
      ],
    }),

    /**
     * Update a question
     */
    updateQuestion: builder.mutation<
      Question,
      { quizId: string; questionId: string; data: Partial<CreateQuestionData> }
    >({
      query: ({ quizId, questionId, data }) => ({
        url: `/quizzes/${quizId}/questions/${questionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { quizId, questionId }) => [
        { type: "Quiz", id: quizId },
        { type: "QuizQuestions", id: quizId },
      ],
    }),

    /**
     * Delete a question
     */
    deleteQuestion: builder.mutation<
      { success: boolean; message: string },
      { quizId: string; questionId: string }
    >({
      query: ({ quizId, questionId }) => ({
        url: `/quizzes/${quizId}/questions/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: "Quiz", id: quizId },
        { type: "QuizQuestions", id: quizId },
      ],
    }),

    /**
     * Reorder questions
     */
    reorderQuestions: builder.mutation<
      { success: boolean },
      { quizId: string; questionOrders: Array<{ id: string; order: number }> }
    >({
      query: ({ quizId, questionOrders }) => ({
        url: `/quizzes/${quizId}/questions/reorder`,
        method: "POST",
        body: { questionOrders },
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: "Quiz", id: quizId },
        { type: "QuizQuestions", id: quizId },
      ],
    }),

    // ==================== ATTEMPT MUTATIONS ====================

    /**
     * Start a quiz attempt
     */
    startQuizAttempt: builder.mutation<
      { attemptId: string; timeLimit?: number; questions: any[] },
      string
    >({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/attempt`,
        method: "POST",
      }),
      invalidatesTags: (result, error, quizId) => [
        { type: "QuizAttempts", id: quizId },
      ],
    }),

    /**
     * Submit quiz attempt
     */
    submitQuizAttempt: builder.mutation<
      {
        score: number;
        percentage: number;
        isPassed: boolean;
        result: QuizResult;
      },
      { quizId: string; attemptId: string; data: SubmitQuizData }
    >({
      query: ({ quizId, attemptId, data }) => ({
        url: `/quizzes/${quizId}/attempt/${attemptId}/submit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { quizId, attemptId }) => [
        { type: "Quiz", id: quizId },
        { type: "QuizAttempts", id: quizId },
        { type: "QuizResults", id: quizId },
      ],
    }),

    /**
     * Get attempt details
     */
    getAttemptDetails: builder.query<
      QuizAttempt,
      { quizId: string; attemptId: string }
    >({
      query: ({ quizId, attemptId }) =>
        `/quizzes/${quizId}/attempt/${attemptId}`,
      providesTags: (result, error, { attemptId }) => [
        { type: "QuizAttempts", id: attemptId },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

// Quiz hooks
export const {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizStatsQuery,
  useGetQuizAnalyticsQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  usePublishQuizMutation,
  useArchiveQuizMutation,
} = quizApi;

// Question hooks
export const {
  useGetQuizQuestionsQuery,
  useAddQuestionMutation,
  useAddBulkQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
} = quizApi;

// Attempt hooks
export const {
  useGetQuizAttemptsQuery,
  useGetQuizResultsQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAttemptMutation,
  useGetAttemptDetailsQuery,
} = quizApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch quiz data
 */
export const usePrefetchQuiz = () => {
  const api = quizApi.usePrefetch("getQuizById");
  return (id: string) => api(id);
};

/**
 * Hook to get quizzes with auto-refresh
 */
export const useQuizzesWithAutoRefresh = (filters: QuizFilters) => {
  return useGetQuizzesQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
