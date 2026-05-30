import { baseApi } from "./baseApi";

export interface GradeRecord {
  id: string;
  studentId: string;
  examId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string | null;
  status: string;
  createdAt: string;
  student?: { id: string; name: string; profileImage?: string | null };
  exam?: { id: string; title: string; subject: string; fullMarks: number };
}

export interface GradeFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  examId?: string;
  studentId?: string;
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

export interface GradeStats {
  totalRecords: number;
  averagePercentage: number;
  passedCount: number;
  failedCount: number;
}

export const gradeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGrades: builder.query<PaginatedResponse<GradeRecord>, GradeFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return { url: `/grades?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "Grade" as const, id })), { type: "Grade", id: "LIST" }]
          : [{ type: "Grade", id: "LIST" }],
    }),

    getGradeStats: builder.query<{ data: GradeStats }, void>({
      query: () => "/grades/stats",
      providesTags: ["GradeStats"],
    }),
  }),
});

export const {
  useGetGradesQuery,
  useGetGradeStatsQuery,
} = gradeApi;
