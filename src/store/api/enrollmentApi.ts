// src/store/api/enrollmentApi.ts

import { baseApi } from "./baseApi";

export const enrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ===============================
    GET ALL ENROLLMENTS
    =============================== */

    getEnrollments: builder.query({
      query: (params) => ({
        url: "/enrollments",
        method: "GET",
        params,
      }),
      providesTags: ["Enrollment"],
    }),

    /* ===============================
    GET SINGLE ENROLLMENT
    =============================== */

    getEnrollment: builder.query({
      query: (id: string) => ({
        url: `/enrollments/${id}`,
        method: "GET",
      }),
      providesTags: ["Enrollment"],
    }),

    /* ===============================
    UPDATE ENROLLMENT
    =============================== */

    updateEnrollment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enrollments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Enrollment"],
    }),

    /* ===============================
    DELETE ENROLLMENT
    =============================== */

    deleteEnrollment: builder.mutation({
      query: (id: string) => ({
        url: `/enrollments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enrollment"],
    }),

    /* ===============================
    UPDATE ENROLLMENT STATUS
    =============================== */

    updateEnrollmentStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/enrollments/${id}/status`,
        method: "PATCH",
        body: { status, reason },
      }),
      invalidatesTags: ["Enrollment"],
    }),

    /* ===============================
    BULK ACTIONS
    =============================== */

    bulkEnrollmentAction: builder.mutation({
      query: (data) => ({
        url: "/enrollments/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enrollment"],
    }),

    /* ===============================
    ENROLLMENT STATS
    =============================== */

    getEnrollmentStats: builder.query({
      query: () => ({
        url: "/enrollments/stats",
        method: "GET",
      }),
    }),

    /* ===============================
    GET INSTALLMENTS
    =============================== */

    getInstallments: builder.query({
      query: (id: string) => ({
        url: `/enrollments/${id}/installments`,
        method: "GET",
      }),
      providesTags: ["Enrollment"],
    }),

    /* ===============================
    CREATE INSTALLMENT PLAN
    =============================== */

    createInstallments: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enrollments/${id}/installments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enrollment"],
    }),

    /* ===============================
    GET ENROLLMENT PROGRESS
    =============================== */

    getEnrollmentProgress: builder.query({
      query: (id: string) => ({
        url: `/enrollments/${id}/progress`,
        method: "GET",
      }),
    }),

    /* ===============================
    UPDATE PROGRESS
    =============================== */

    updateEnrollmentProgress: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enrollments/${id}/progress`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Enrollment"],
    }),
  }),
});

export const {
  useGetEnrollmentsQuery,
  useGetEnrollmentQuery,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useUpdateEnrollmentStatusMutation,
  useBulkEnrollmentActionMutation,
  useGetEnrollmentStatsQuery,
  useGetInstallmentsQuery,
  useCreateInstallmentsMutation,
  useGetEnrollmentProgressQuery,
  useUpdateEnrollmentProgressMutation,
} = enrollmentApi;
