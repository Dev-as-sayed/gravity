// src/store/api/studentApi.ts
import { baseApi } from "./baseApi";

// Types
export interface Student {
  id: string;
  name: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  institute?: string | null;
  educationLevel?: string | null;
  class?: string | null;
  board?: string | null;
  hscYear?: number | null;
  group?: string | null;
  rollNumber?: string | null;
  registrationNumber?: string | null;
  guardianId?: string | null;
  preferredSubjects: string[];
  learningGoals: string[];
  examTargets: string[];
  totalCourses: number;
  averageScore: number;
  attendanceRate: number;
  rank?: number | null;
  percentile?: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
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
  guardian?: {
    id: string;
    name: string;
    relationship: string;
    occupation?: string | null;
    user?: {
      email: string;
      phone: string;
    };
  } | null;
  enrollments?: any[];
  _count?: {
    enrollments: number;
    attendances: number;
    quizResults: number;
    examResults: number;
    payments: number;
    doubts: number;
  };
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  class?: string;
  board?: string;
  educationLevel?: string;
  hasGuardian?: boolean;
  sortBy?: "name" | "createdAt" | "averageScore" | "attendanceRate";
  sortOrder?: "asc" | "desc";
}

export interface CreateStudentData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  profileImage?: string;
  institute?: string;
  educationLevel?: string;
  class?: string;
  board?: string;
  hscYear?: number;
  group?: string;
  rollNumber?: string;
  registrationNumber?: string;
  guardianId?: string;
  preferredSubjects?: string[];
  learningGoals?: string[];
  examTargets?: string[];
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  isActive?: boolean;
}

export interface BulkActionData {
  studentIds: string[];
  action: "activate" | "deactivate" | "delete" | "assignGuardian";
  guardianId?: string;
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

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  byClass: Array<{ class: string; _count: number }>;
  byBoard: Array<{ board: string; _count: number }>;
  byGender: Array<{ gender: string; _count: number }>;
  enrollmentStats: Array<{ status: string; _count: number }>;
  topPerformers: Array<{
    id: string;
    name: string;
    averageScore: number;
    class?: string | null;
    user: { email: string };
  }>;
  recentRegistrations: number;
  guardianCoverage: {
    withGuardian: number;
    withoutGuardian: number;
    percentage: number;
  };
  completionRate: number;
}

export interface StudentProgress {
  overview: {
    totalQuizzes: number;
    totalExams: number;
    totalAttendance: number;
    totalAssignments: number;
    avgQuizScore: number;
    avgExamScore: number;
  };
  quizPerformance: any[];
  examPerformance: any[];
  assignments: any[];
  subjectPerformance: Array<{ subject: string; average: number }>;
  progressHistory: any[];
}

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get paginated list of students with advanced filtering
     */
    getStudents: builder.query<PaginatedResponse<Student>, StudentFilters>({
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
          url: `/students?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Student" as const,
                id,
              })),
              { type: "Student", id: "LIST" },
            ]
          : [{ type: "Student", id: "LIST" }],
    }),

    /**
     * Get single student by ID with complete profile data
     */
    getStudentById: builder.query<Student, string>({
      query: (id) => `/students/${id}`,
      providesTags: (result, error, id) => [{ type: "Student", id }],
      transformResponse: (response: { data: Student }) => response.data,
    }),

    /**
     * Get student statistics
     */
    getStudentStats: builder.query<{ data: StudentStats }, void>({
      query: () => "/students/stats",
      providesTags: ["StudentStats"],
    }),

    /**
     * Get student progress
     */
    getStudentProgress: builder.query<{ data: StudentProgress }, string>({
      query: (id) => `/students/${id}/progress`,
      providesTags: (result, error, id) => [{ type: "StudentProgress", id }],
    }),

    // ==================== MUTATIONS ====================

    /**
     * Create a new student
     */
    createStudent: builder.mutation<Student, CreateStudentData>({
      query: (data) => ({
        url: "/students",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Student", id: "LIST" }, "StudentStats"],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || "Failed to create student",
        errors: response.data?.errors,
      }),
    }),

    /**
     * Update an existing student
     */
    updateStudent: builder.mutation<
      Student,
      { id: string; data: UpdateStudentData }
    >({
      query: ({ id, data }) => ({
        url: `/students/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Student", id },
        { type: "Student", id: "LIST" },
        "StudentStats",
      ],
    }),

    /**
     * Delete a student
     */
    deleteStudent: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Student", id },
        { type: "Student", id: "LIST" },
        "StudentStats",
      ],
    }),

    /**
     * Toggle student active status
     */
    toggleStudentStatus: builder.mutation<
      { studentId: string; userId: string; isActive: boolean },
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/students/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Student", id },
        { type: "Student", id: "LIST" },
        "StudentStats",
      ],
    }),

    /**
     * Bulk operations on students
     */
    bulkStudentAction: builder.mutation<
      { success: boolean; count: number },
      BulkActionData
    >({
      query: (data) => ({
        url: "/students/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Student", id: "LIST" }, "StudentStats"],
    }),

    /**
     * Assign guardian to student
     */
    assignGuardian: builder.mutation<
      { success: boolean; count: number },
      { studentIds: string[]; guardianId: string }
    >({
      query: (data) => ({
        url: "/students/bulk",
        method: "POST",
        body: {
          studentIds: data.studentIds,
          action: "assignGuardian",
          guardianId: data.guardianId,
        },
      }),
      invalidatesTags: (result, error, { studentIds }) =>
        studentIds.map((id) => ({ type: "Student", id })),
    }),
  }),
});

// ==================== HOOKS ====================

// Queries
export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentStatsQuery,
  useGetStudentProgressQuery,
} = studentApi;

// Mutations
export const {
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useToggleStudentStatusMutation,
  useBulkStudentActionMutation,
  useAssignGuardianMutation,
} = studentApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch student data
 */
export const usePrefetchStudent = () => {
  const api = studentApi.usePrefetch("getStudentById");
  return (id: string) => api(id);
};

/**
 * Hook to get students with auto-refresh
 */
export const useStudentsWithAutoRefresh = (filters: StudentFilters) => {
  return useGetStudentsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
