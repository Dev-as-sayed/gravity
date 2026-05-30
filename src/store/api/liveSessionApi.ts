// src/store/api/liveSessionApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface LiveSession {
  id: string;
  title: string;
  description?: string | null;
  teacherId: string;
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
  } | null;
  batchId: string;
  batch?: {
    id: string;
    name: string;
    subject: string;
  } | null;
  startTime: string;
  endTime: string;
  duration: number;
  platform: "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "YOUTUBE" | "CUSTOM";
  meetingUrl?: string | null;
  isLive: boolean;
  isCompleted: boolean;
  isRecorded: boolean;
  attendees?: number | null;
  attendanceCount: number;
}

export interface LiveSessionFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  teacherId?: string;
  isLive?: boolean;
  isCompleted?: boolean;
  from?: string;
  to?: string;
}

export interface CreateLiveSessionData {
  title: string;
  description?: string;
  teacherId: string;
  batchId: string;
  startTime: string;
  endTime: string;
  platform: "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "YOUTUBE" | "CUSTOM";
  meetingUrl?: string;
}

export interface UpdateLiveSessionData extends Partial<CreateLiveSessionData> {
  isLive?: boolean;
  isCompleted?: boolean;
  isRecorded?: boolean;
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

export const liveSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getLiveSessions: builder.query<PaginatedResponse<LiveSession>, LiveSessionFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/live-sessions?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "LiveSession" as const, id })),
              { type: "LiveSession", id: "LIST" },
            ]
          : [{ type: "LiveSession", id: "LIST" }],
    }),

    getLiveSession: builder.query<LiveSession, string>({
      query: (id) => `/live-sessions/${id}`,
      providesTags: (result, error, id) => [{ type: "LiveSession", id }],
      transformResponse: (response: { data: LiveSession }) => response.data,
    }),

    // ==================== MUTATIONS ====================

    createLiveSession: builder.mutation<LiveSession, CreateLiveSessionData>({
      query: (data) => ({
        url: "/live-sessions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "LiveSession", id: "LIST" }],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to create live session",
        errors: response?.data?.errors || [],
      }),
    }),

    updateLiveSession: builder.mutation<LiveSession, { id: string; data: UpdateLiveSessionData }>({
      query: ({ id, data }) => ({
        url: `/live-sessions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LiveSession", id },
        { type: "LiveSession", id: "LIST" },
      ],
    }),

    deleteLiveSession: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/live-sessions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "LiveSession", id },
        { type: "LiveSession", id: "LIST" },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetLiveSessionsQuery,
  useGetLiveSessionQuery,
  useCreateLiveSessionMutation,
  useUpdateLiveSessionMutation,
  useDeleteLiveSessionMutation,
} = liveSessionApi;
