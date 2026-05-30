// src/store/api/teacherApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Teacher {
  id: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    phone: string;
    isActive: boolean;
    isVerified: boolean;
    profileImage?: string | null;
    createdAt: string;
  } | null;
  name: string;
  bio?: string | null;
  qualification?: string | null;
  expertise: string[];
  experience?: number | null;
  averageRating: number;
  totalStudents: number;
  totalBatches: number;
}

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "averageRating" | "totalStudents" | "totalBatches" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface UpdateTeacherData {
  name?: string;
  bio?: string;
  qualification?: string;
  expertise?: string[];
  experience?: number;
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

export interface TeacherStats {
  total: number;
  active: number;
  inactive: number;
  averageRating: number;
  totalStudents: number;
  totalBatches: number;
  topTeachers: Array<{
    id: string;
    name: string;
    averageRating: number;
    totalStudents: number;
    totalBatches: number;
  }>;
  subjectDistribution: Array<{ subject: string; _count: number }>;
  recentJoins: number;
}

// ==================== API ENDPOINTS ====================

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getTeachers: builder.query<PaginatedResponse<Teacher>, TeacherFilters>({
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
          url: `/teachers?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Teacher" as const, id })),
              { type: "Teacher", id: "LIST" },
            ]
          : [{ type: "Teacher", id: "LIST" }],
    }),

    getTeacher: builder.query<Teacher, string>({
      query: (id) => `/teachers/${id}`,
      providesTags: (result, error, id) => [{ type: "Teacher", id }],
      transformResponse: (response: { data: Teacher }) => response.data,
    }),

    getTeacherStats: builder.query<{ data: TeacherStats }, void>({
      query: () => "/teachers/stats",
      providesTags: ["TeacherStats"],
    }),

    // ==================== MUTATIONS ====================

    updateTeacher: builder.mutation<Teacher, { id: string; data: UpdateTeacherData }>({
      query: ({ id, data }) => ({
        url: `/teachers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teacher", id },
        { type: "Teacher", id: "LIST" },
        "TeacherStats",
      ],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useGetTeacherStatsQuery,
  useUpdateTeacherMutation,
} = teacherApi;
