// src/redux/api/teacherApi.ts

import {
  CreateTeacherData,
  Teacher,
  TeacherFilters,
  UpdateTeacherData,
} from "@/type/teacher";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface PaginatedTeacherResponse {
  success: boolean;
  data: Teacher[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const teacherApi = createApi({
  reducerPath: "teacherApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),

  tagTypes: ["Teacher", "TeacherStats"],

  endpoints: (builder) => ({
    // =====================================
    // GET ALL TEACHERS
    // =====================================

    getTeachers: builder.query<PaginatedTeacherResponse, TeacherFilters>({
      query: (params) => ({
        url: "/teachers",
        params,
      }),

      providesTags: ["Teacher"],
    }),

    // =====================================
    // GET SINGLE TEACHER
    // =====================================

    getTeacher: builder.query<ApiResponse<Teacher>, string>({
      query: (id) => `/teachers/${id}`,
      providesTags: ["Teacher"],
    }),

    // =====================================
    // CREATE TEACHER
    // =====================================

    createTeacher: builder.mutation<ApiResponse<Teacher>, CreateTeacherData>({
      query: (data) => ({
        url: "/teachers",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Teacher"],
    }),

    // =====================================
    // UPDATE TEACHER
    // =====================================

    updateTeacher: builder.mutation<
      ApiResponse<Teacher>,
      { id: string; data: UpdateTeacherData }
    >({
      query: ({ id, data }) => ({
        url: `/teachers/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: ["Teacher"],
    }),

    // =====================================
    // ACTIVATE / DEACTIVATE
    // =====================================

    toggleTeacherStatus: builder.mutation<
      ApiResponse<any>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/teachers/${id}`,
        method: "PATCH",
        body: { isActive },
      }),

      invalidatesTags: ["Teacher"],
    }),

    // =====================================
    // DELETE TEACHER
    // =====================================

    deleteTeacher: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Teacher"],
    }),

    // =====================================
    // TEACHER STATS
    // =====================================

    getTeacherStats: builder.query<any, void>({
      query: () => "/teachers/stats",

      providesTags: ["TeacherStats"],
    }),

    // =====================================
    // BULK ACTION
    // =====================================

    bulkTeacherAction: builder.mutation<
      ApiResponse<any>,
      { teacherIds: string[]; action: "activate" | "deactivate" | "delete" }
    >({
      query: (data) => ({
        url: "/teachers/bulk",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Teacher"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useToggleTeacherStatusMutation,
  useGetTeacherStatsQuery,
  useBulkTeacherActionMutation,
} = teacherApi;
