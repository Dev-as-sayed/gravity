// src/store/api/batchApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  subject: string;
  category: string;
  thumbnail?: string | null;
  bannerImage?: string | null;
  icon?: string | null;
  teacherId: string;
  duration?: number | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  prerequisites: string[];
  learningOutcomes: string[];
  price: number;
  offerPrice?: number | null;
  isFree: boolean;
  totalBatches: number;
  totalStudents: number;
  averageRating: number;
  totalReviews: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords: string[];
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
    expertise: string[];
  };
  batches?: Batch[];
  _count?: {
    batches: number;
  };
}

export interface Batch {
  id: string;
  name: string;
  slug: string;
  courseId: string;
  teacherId: string;
  subject: string;
  description?: string | null;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  language?: string | null;
  maxStudents?: number | null;
  currentEnrollments: number;
  waitlistCount: number;
  minimumStudents?: number | null;
  startDate: string;
  endDate?: string | null;
  schedule?: any;
  totalClasses?: number | null;
  completedClasses: number;
  liveClassLink?: string | null;
  liveClassPlatform?: string | null;
  meetingId?: string | null;
  meetingPassword?: string | null;
  recordingUrl?: string | null;
  studyMaterialUrl?: string | null;
  resources?: any;
  price: number;
  offerPrice?: number | null;
  offerDeadline?: string | null;
  earlyBirdPrice?: number | null;
  earlyBirdDeadline?: string | null;
  discountPercent?: number | null;
  discountCode?: string | null;
  isActive: boolean;
  isPublished: boolean;
  enrollmentOpen: boolean;
  visibility: "PUBLIC" | "PRIVATE" | "LINK_ONLY";
  syllabus?: any;
  topics: string[];
  prerequisites: string[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
    profileImage?: string | null;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  moderators?: Array<{
    id: string;
    name: string;
  }>;
  enrollments?: Enrollment[];
  notes?: any[];
  quizzes?: any[];
  exams?: any[];
  announcements?: any[];
  materials?: BatchMaterial[];
  reviews?: BatchReview[];
  _count?: {
    enrollments: number;
    notes: number;
    quizzes: number;
    exams: number;
    materials: number;
  };
  studentEnrollmentStatus?: string | null;
}

export interface BatchMaterial {
  id: string;
  batchId: string;
  title: string;
  description?: string | null;
  type:
    | "NOTE"
    | "VIDEO"
    | "ASSIGNMENT"
    | "PRACTICE_SET"
    | "REFERENCE"
    | "FORMULA_SHEET";
  fileUrl?: string | null;
  fileSize?: number | null;
  duration?: number | null;
  isFree: boolean;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  batchId: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "WAITLISTED"
    | "CANCELLED"
    | "COMPLETED"
    | "DROPPED";
  appliedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectedReason?: string | null;
  completedAt?: string | null;
  droppedAt?: string | null;
  droppedReason?: string | null;
  paymentStatus:
    | "PENDING"
    | "PARTIAL"
    | "COMPLETED"
    | "OVERDUE"
    | "REFUNDED"
    | "FAILED"
    | "PROCESSING";
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  progressPercentage: number;
  classesAttended: number;
  totalClasses: number;
  assignmentsDone: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    email: string;
    phone: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
  paymentDate: string;
  transactionId?: string | null;
}

export interface BatchReview {
  id: string;
  batchId: string;
  studentId: string;
  rating: number;
  comment?: string | null;
  pros: string[];
  cons: string[];
  isAnonymous: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: {
    name: string;
    profileImage?: string | null;
  };
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  level?: string;
  teacherId?: string;
  isFree?: boolean;
  sortBy?: "title" | "createdAt" | "price" | "averageRating";
  sortOrder?: "asc" | "desc";
}

export interface BatchFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  mode?: string;
  teacherId?: string;
  courseId?: string;
  isActive?: boolean;
  enrollmentOpen?: boolean;
  minPrice?: number;
  maxPrice?: number;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: "startDate" | "price" | "averageRating" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateCourseData {
  title: string;
  slug?: string;
  description?: string;
  subject: string;
  category?: string;
  thumbnail?: string;
  bannerImage?: string;
  icon?: string;
  teacherId?: string;
  duration?: number;
  level?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  price?: number;
  offerPrice?: number;
  isFree?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export interface CreateBatchData {
  name: string;
  slug?: string;
  courseId: string;
  teacherId?: string;
  subject: string;
  description?: string;
  mode?: string;
  language?: string;
  maxStudents?: number;
  minimumStudents?: number;
  startDate: string;
  endDate?: string;
  schedule?: any;
  totalClasses?: number;
  liveClassLink?: string;
  liveClassPlatform?: string;
  meetingId?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  studyMaterialUrl?: string;
  resources?: any;
  price?: number;
  offerPrice?: number;
  offerDeadline?: string;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  discountPercent?: number;
  discountCode?: string;
  isActive?: boolean;
  isPublished?: boolean;
  enrollmentOpen?: boolean;
  visibility?: string;
  syllabus?: any;
  topics?: string[];
  prerequisites?: string[];
}

export interface UpdateBatchData extends Partial<CreateBatchData> {}

export interface CreateBatchMaterialData {
  title: string;
  description?: string;
  type: string;
  fileUrl?: string;
  fileSize?: number;
  duration?: number;
  isFree?: boolean;
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
  pros?: string[];
  cons?: string[];
  isAnonymous?: boolean;
}

export interface EnrollmentData {
  autoApprove?: boolean;
  metadata?: any;
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

export interface BatchStats {
  total: number;
  active: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  enrollments: number;
  revenue: number;
  popularSubjects: Array<{ subject: string; _count: number }>;
  modeDistribution: Array<{ mode: string; _count: number }>;
  completionRate: number;
}

// ==================== API ENDPOINTS ====================

export const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== COURSE ENDPOINTS ====================

    /**
     * Get paginated list of courses
     */
    getCourses: builder.query<PaginatedResponse<Course>, CourseFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/courses?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Course" as const, id })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),

    /**
     * Get single course by ID
     */
    getCourseById: builder.query<Course, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
      transformResponse: (response: { data: Course }) => response.data,
    }),

    /**
     * Create a new course
     */
    createCourse: builder.mutation<Course, CreateCourseData>({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    /**
     * Update an existing course
     */
    updateCourse: builder.mutation<
      Course,
      { id: string; data: UpdateCourseData }
    >({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    /**
     * Delete a course
     */
    deleteCourse: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    // ==================== BATCH ENDPOINTS ====================

    /**
     * Get paginated list of batches
     */
    getBatches: builder.query<PaginatedResponse<Batch>, BatchFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (key === "minPrice" || key === "maxPrice") {
              params.append(key, value.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        });

        return {
          url: `/batches?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Batch" as const, id })),
              { type: "Batch", id: "LIST" },
            ]
          : [{ type: "Batch", id: "LIST" }],
    }),

    /**
     * Get single batch by ID
     */
    getBatchById: builder.query<Batch, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (result, error, id) => [{ type: "Batch", id }],
      transformResponse: (response: { data: Batch }) => response.data,
    }),

    /**
     * Create a new batch
     */
    createBatch: builder.mutation<Batch, CreateBatchData>({
      query: (data) => ({
        url: "/batches",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Batch", id: "LIST" }],
    }),

    /**
     * Update an existing batch
     */
    updateBatch: builder.mutation<Batch, { id: string; data: UpdateBatchData }>(
      {
        query: ({ id, data }) => ({
          url: `/batches/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Batch", id },
          { type: "Batch", id: "LIST" },
        ],
      },
    ),

    /**
     * Delete a batch
     */
    deleteBatch: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/batches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Toggle batch active status
     */
    toggleBatchStatus: builder.mutation<
      Batch,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/batches/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),

    // ==================== ENROLLMENT ENDPOINTS ====================

    /**
     * Enroll in a batch
     */
    enrollInBatch: builder.mutation<
      Enrollment,
      { batchId: string; data?: EnrollmentData }
    >({
      query: ({ batchId, data }) => ({
        url: `/batches/${batchId}/enroll`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "Batch", id: batchId },
        { type: "Enrollment" },
      ],
    }),

    /**
     * Get batch enrollments
     */
    getBatchEnrollments: builder.query<Enrollment[], string>({
      query: (batchId) => `/batches/${batchId}/enrollments`,
      providesTags: (result, error, batchId) => [
        { type: "Enrollment", id: batchId },
      ],
      transformResponse: (response: { data: Enrollment[] }) => response.data,
    }),

    /**
     * Update enrollment status
     */
    updateEnrollmentStatus: builder.mutation<
      Enrollment,
      { enrollmentId: string; status: string; reason?: string }
    >({
      query: ({ enrollmentId, status, reason }) => ({
        url: `/enrollments/${enrollmentId}`,
        method: "PATCH",
        body: { status, reason },
      }),
      invalidatesTags: ["Enrollment"],
    }),

    // ==================== BATCH MATERIALS ENDPOINTS ====================

    /**
     * Get batch materials
     */
    getBatchMaterials: builder.query<BatchMaterial[], string>({
      query: (batchId) => `/batches/${batchId}/materials`,
      providesTags: (result, error, batchId) => [
        { type: "BatchMaterial", id: batchId },
      ],
      transformResponse: (response: { data: BatchMaterial[] }) => response.data,
    }),

    /**
     * Add material to batch
     */
    addBatchMaterial: builder.mutation<
      BatchMaterial,
      { batchId: string; data: CreateBatchMaterialData }
    >({
      query: ({ batchId, data }) => ({
        url: `/batches/${batchId}/materials`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchMaterial", id: batchId },
        { type: "Batch", id: batchId },
      ],
    }),

    /**
     * Delete batch material
     */
    deleteBatchMaterial: builder.mutation<
      { success: boolean; message: string },
      { batchId: string; materialId: string }
    >({
      query: ({ batchId, materialId }) => ({
        url: `/batches/${batchId}/materials/${materialId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchMaterial", id: batchId },
      ],
    }),

    // ==================== REVIEWS ENDPOINTS ====================

    /**
     * Get batch reviews
     */
    getBatchReviews: builder.query<
      { reviews: BatchReview[]; stats: any },
      string
    >({
      query: (batchId) => `/batches/${batchId}/reviews`,
      providesTags: (result, error, batchId) => [
        { type: "BatchReview", id: batchId },
      ],
      transformResponse: (response: { data: any }) => response.data,
    }),

    /**
     * Add review to batch
     */
    addBatchReview: builder.mutation<
      BatchReview,
      { batchId: string; data: CreateReviewData }
    >({
      query: ({ batchId, data }) => ({
        url: `/batches/${batchId}/reviews`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchReview", id: batchId },
        { type: "Batch", id: batchId },
      ],
    }),

    // ==================== STATISTICS ENDPOINTS ====================

    /**
     * Get batch statistics
     */
    getBatchStats: builder.query<BatchStats, void>({
      query: () => "/batches/stats",
      providesTags: ["BatchStats"],
    }),

    /**
     * Get teacher's batch statistics
     */
    getTeacherBatchStats: builder.query<BatchStats, string>({
      query: (teacherId) => `/batches/stats/teacher/${teacherId}`,
      providesTags: ["BatchStats"],
    }),
  }),
});

// ==================== HOOKS ====================

// Course hooks
export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = batchApi;

// Batch hooks
export const {
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useToggleBatchStatusMutation,
} = batchApi;

// Enrollment hooks
export const {
  useEnrollInBatchMutation,
  useGetBatchEnrollmentsQuery,
  useUpdateEnrollmentStatusMutation,
} = batchApi;

// Batch materials hooks
export const {
  useGetBatchMaterialsQuery,
  useAddBatchMaterialMutation,
  useDeleteBatchMaterialMutation,
} = batchApi;

// Review hooks
export const { useGetBatchReviewsQuery, useAddBatchReviewMutation } = batchApi;

// Statistics hooks
export const { useGetBatchStatsQuery, useGetTeacherBatchStatsQuery } = batchApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch batch data
 */
export const usePrefetchBatch = () => {
  const api = batchApi.usePrefetch("getBatchById");
  return (id: string) => api(id);
};

/**
 * Hook to get batches with auto-refresh
 */
export const useBatchesWithAutoRefresh = (filters: BatchFilters) => {
  return useGetBatchesQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
