// src/store/api/reportApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface AttendanceReport {
  summary: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    attendanceRate: number;
  };
  daily: Array<{
    date: string;
    status: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
  }>;
  byStudent?: Array<{
    studentId: string;
    name: string;
    present: number;
    absent: number;
    late: number;
    rate: number;
  }>;
}

export interface PerformanceReport {
  summary: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    totalStudents: number;
  };
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  byStudent?: Array<{
    studentId: string;
    name: string;
    score: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    rank: number;
  }>;
  subjectBreakdown?: Array<{
    subject: string;
    average: number;
    highest: number;
    lowest: number;
  }>;
}

export interface AttendanceReportParams {
  batchId: string;
  from?: string;
  to?: string;
  studentId?: string;
}

export interface PerformanceReportParams {
  batchId: string;
  examId?: string;
  from?: string;
  to?: string;
}

// ==================== API ENDPOINTS ====================

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getAttendanceReport: builder.query<{ data: AttendanceReport }, AttendanceReportParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString());
          }
        });

        return {
          url: `/reports/attendance?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Report"],
    }),

    getPerformanceReport: builder.query<{ data: PerformanceReport }, PerformanceReportParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString());
          }
        });

        return {
          url: `/reports/performance?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Report"],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetAttendanceReportQuery,
  useGetPerformanceReportQuery,
} = reportApi;
