import { baseApi } from "./baseApi";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  batchId?: string | null;
  batchName?: string | null;
  isUrgent: boolean;
  isPinned: boolean;
  createdBy: { id: string; name: string };
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementFilters {
  page?: number;
  limit?: number;
  search?: string;
  batchId?: string;
  isUrgent?: boolean;
  isPinned?: boolean;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  batchId?: string;
  isUrgent?: boolean;
  isPinned?: boolean;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  batchId?: string;
  isUrgent?: boolean;
  isPinned?: boolean;
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

export interface AnnouncementStats {
  total: number;
  pinned: number;
  urgent: number;
  totalViews: number;
}

export const announcementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<PaginatedResponse<Announcement>, AnnouncementFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return { url: `/announcements?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "Announcement" as const, id })), { type: "Announcement", id: "LIST" }]
          : [{ type: "Announcement", id: "LIST" }],
    }),

    getAnnouncement: builder.query<Announcement, string>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [{ type: "Announcement", id }],
      transformResponse: (response: { data: Announcement }) => response.data,
    }),

    getAnnouncementStats: builder.query<{ data: AnnouncementStats }, void>({
      query: () => "/announcements/stats",
      providesTags: ["AnnouncementStats"],
    }),

    createAnnouncement: builder.mutation<Announcement, CreateAnnouncementData>({
      query: (data) => ({ url: "/announcements", method: "POST", body: data }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }, "AnnouncementStats"],
    }),

    updateAnnouncement: builder.mutation<Announcement, { id: string; data: UpdateAnnouncementData }>({
      query: ({ id, data }) => ({ url: `/announcements/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: "Announcement", id }, { type: "Announcement", id: "LIST" }, "AnnouncementStats"],
    }),

    deleteAnnouncement: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/announcements/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "Announcement", id }, { type: "Announcement", id: "LIST" }, "AnnouncementStats"],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementQuery,
  useGetAnnouncementStatsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;
