// src/store/api/attendanceApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Attendance {
  id: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  batchId: string;
  batch?: {
    id: string;
    name: string;
    subject: string;
  } | null;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "HOLIDAY";
  checkInTime?: string | null;
  checkOutTime?: string | null;
  duration?: number | null;
  markedBy: string;
  verified: boolean;
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  batchId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface CreateAttendanceData {
  studentId: string;
  batchId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  checkInTime?: string;
  checkOutTime?: string;
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {
  verified?: boolean;
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

// ==================== API ENDPOINTS ====================

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getAttendance: builder.query<PaginatedResponse<Attendance>, AttendanceFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/attendance?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Attendance" as const, id })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
    }),

    // ==================== MUTATIONS ====================

    createAttendance: builder.mutation<Attendance, CreateAttendanceData>({
      query: (data) => ({
        url: "/attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to mark attendance",
        errors: response?.data?.errors || [],
      }),
    }),

    updateAttendance: builder.mutation<Attendance, { id: string; data: UpdateAttendanceData }>({
      query: ({ id, data }) => ({
        url: `/attendance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
      ],
    }),

    deleteAttendance: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetAttendanceQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
