// src/store/api/scheduleApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface ScheduleEntry {
  id: string;
  batchId: string;
  batch?: {
    id: string;
    name: string;
    subject: string;
  } | null;
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
  subject: string;
  room?: string | null;
}

export interface ScheduleFilters {
  batchId?: string;
  teacherId?: string;
  day?: string;
}

// ==================== API ENDPOINTS ====================

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getSchedule: builder.query<ScheduleEntry[], ScheduleFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const queryString = params.toString();
        return {
          url: `/schedule${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Schedule" as const, id })),
              { type: "Schedule", id: "LIST" },
            ]
          : [{ type: "Schedule", id: "LIST" }],
      transformResponse: (response: { data: ScheduleEntry[] }) => response.data,
    }),

    getScheduleByBatch: builder.query<ScheduleEntry[], string>({
      query: (batchId) => `/schedule?batchId=${batchId}`,
      providesTags: (result, error, batchId) => [
        { type: "Schedule", id: `BATCH_${batchId}` },
      ],
      transformResponse: (response: { data: ScheduleEntry[] }) => response.data,
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetScheduleQuery,
  useGetScheduleByBatchQuery,
} = scheduleApi;
