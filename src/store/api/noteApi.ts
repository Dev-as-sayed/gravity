// src/store/api/noteApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Note {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  duration?: number | null;
  pages?: number | null;
  teacherId: string;
  batchId?: string | null;
  subject: string;
  topic?: string | null;
  topics: string[];
  isPublic: boolean;
  isPremium: boolean;
  price?: number | null;
  freePreview: boolean;
  downloads: number;
  views: number;
  likes: number;
  saves: number;
  tags: string[];
  difficulty: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords: string[];
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
    bio?: string | null;
  };
  batch?: {
    id: string;
    name: string;
    subject: string;
  } | null;
  _count?: {
    downloadedBy: number;
    savedBy: number;
  };
}

export interface NoteFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  topic?: string;
  teacherId?: string;
  batchId?: string;
  difficulty?: string;
  isPublic?: boolean;
  isPremium?: boolean;
  tag?: string;
  sortBy?: "title" | "createdAt" | "downloads" | "views" | "likes";
  sortOrder?: "asc" | "desc";
}

export interface CreateNoteData {
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  duration?: number;
  pages?: number;
  teacherId?: string;
  batchId?: string;
  subject?: string;
  topic?: string;
  topics?: string[];
  isPublic?: boolean;
  isPremium?: boolean;
  price?: number;
  freePreview?: boolean;
  tags?: string[];
  difficulty?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateNoteData extends Partial<CreateNoteData> {}

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

export interface NoteStats {
  total: number;
  public: number;
  premium: number;
  downloads: number;
  views: number;
  popularSubjects: Array<{ subject: string; _count: number }>;
  difficultyDistribution: Array<{ difficulty: string; _count: number }>;
  topAuthors: Array<{
    id: string;
    name: string;
    profileImage?: string | null;
    note_count: number;
    total_downloads: number;
    total_views: number;
  }>;
  premiumRate: number;
}

export interface DownloadResponse {
  fileUrl: string;
  fileType: string;
  filename: string;
}

export interface BulkActionData {
  noteIds: string[];
  action: "publish" | "unpublish" | "premium" | "unpremium" | "delete";
}

// ==================== API ENDPOINTS ====================

export const noteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== NOTE QUERIES ====================

    /**
     * Get paginated list of notes with filters
     */
    getNotes: builder.query<PaginatedResponse<Note>, NoteFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/notes?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Note" as const, id })),
              { type: "Note", id: "LIST" },
            ]
          : [{ type: "Note", id: "LIST" }],
    }),

    /**
     * Get single note by ID
     */
    getNoteById: builder.query<Note, string>({
      query: (id) => `/notes/${id}`,
      providesTags: (result, error, id) => [{ type: "Note", id }],
      transformResponse: (response: { data: Note }) => response.data,
    }),

    /**
     * Get note by slug
     */
    getNoteBySlug: builder.query<Note, string>({
      query: (slug) => `/notes/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Note", id: slug }],
      transformResponse: (response: { data: Note }) => response.data,
    }),

    /**
     * Get note statistics
     */
    getNoteStats: builder.query<{ data: NoteStats }, void>({
      query: () => "/notes/stats",
      providesTags: ["NoteStats"],
    }),

    // ==================== NOTE MUTATIONS ====================

    /**
     * Create a new note
     */
    createNote: builder.mutation<Note, CreateNoteData>({
      query: (data) => ({
        url: "/notes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }, "NoteStats"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to create note",
        errors: response?.data?.errors || [],
      }),
    }),

    /**
     * Update an existing note
     */
    updateNote: builder.mutation<Note, { id: string; data: UpdateNoteData }>({
      query: ({ id, data }) => ({
        url: `/notes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Note", id },
        { type: "Note", id: "LIST" },
        "NoteStats",
      ],
    }),

    /**
     * Delete a note
     */
    deleteNote: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/notes/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Note", id },
          { type: "Note", id: "LIST" },
          "NoteStats",
        ],
      },
    ),

    /**
     * Toggle note public status
     */
    toggleNotePublic: builder.mutation<Note, string>({
      query: (id) => ({
        url: `/notes/${id}/toggle-public`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Note", id },
        { type: "Note", id: "LIST" },
        "NoteStats",
      ],
    }),

    /**
     * Toggle note premium status
     */
    toggleNotePremium: builder.mutation<Note, string>({
      query: (id) => ({
        url: `/notes/${id}/toggle-premium`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Note", id },
        { type: "Note", id: "LIST" },
        "NoteStats",
      ],
    }),

    // ==================== NOTE ACTIONS ====================

    /**
     * Download note (tracks download)
     */
    downloadNote: builder.mutation<DownloadResponse, string>({
      query: (id) => ({
        url: `/notes/${id}/download`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Note", id }],
    }),

    /**
     * Save/unsave note to bookmarks
     */
    saveNote: builder.mutation<{ saved: boolean }, string>({
      query: (id) => ({
        url: `/notes/${id}/save`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Note", id },
        { type: "Note", id: "LIST" },
      ],
    }),

    /**
     * Like note
     */
    likeNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notes/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Note", id }],
    }),

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk operations on notes
     */
    bulkNoteAction: builder.mutation<
      { success: boolean; count: number },
      BulkActionData
    >({
      query: (data) => ({
        url: "/notes/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }, "NoteStats"],
    }),

    /**
     * Bulk publish notes
     */
    bulkPublishNotes: builder.mutation<
      { success: boolean; count: number },
      string[]
    >({
      query: (noteIds) => ({
        url: "/notes/bulk",
        method: "POST",
        body: { noteIds, action: "publish" },
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }, "NoteStats"],
    }),

    /**
     * Bulk unpublish notes
     */
    bulkUnpublishNotes: builder.mutation<
      { success: boolean; count: number },
      string[]
    >({
      query: (noteIds) => ({
        url: "/notes/bulk",
        method: "POST",
        body: { noteIds, action: "unpublish" },
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }, "NoteStats"],
    }),

    /**
     * Bulk make notes premium
     */
    bulkPremiumNotes: builder.mutation<
      { success: boolean; count: number },
      string[]
    >({
      query: (noteIds) => ({
        url: "/notes/bulk",
        method: "POST",
        body: { noteIds, action: "premium" },
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }, "NoteStats"],
    }),

    /**
     * Bulk delete notes
     */
    bulkDeleteNotes: builder.mutation<
      { success: boolean; count: number },
      string[]
    >({
      query: (noteIds) => ({
        url: "/notes/bulk",
        method: "POST",
        body: { noteIds, action: "delete" },
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }, "NoteStats"],
    }),
  }),
});

// ==================== HOOKS ====================

// Note queries
export const {
  useGetNotesQuery,
  useGetNoteByIdQuery,
  useGetNoteBySlugQuery,
  useGetNoteStatsQuery,
} = noteApi;

// Note mutations
export const {
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useToggleNotePublicMutation,
  useToggleNotePremiumMutation,
} = noteApi;

// Note actions
export const {
  useDownloadNoteMutation,
  useSaveNoteMutation,
  useLikeNoteMutation,
} = noteApi;

// Bulk operations
export const {
  useBulkNoteActionMutation,
  useBulkPublishNotesMutation,
  useBulkUnpublishNotesMutation,
  useBulkPremiumNotesMutation,
  useBulkDeleteNotesMutation,
} = noteApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch note data
 */
export const usePrefetchNote = () => {
  const api = noteApi.usePrefetch("getNoteById");
  return (id: string) => api(id);
};

/**
 * Hook to get notes with auto-refresh
 */
export const useNotesWithAutoRefresh = (filters: NoteFilters) => {
  return useGetNotesQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get public notes only
 */
export const usePublicNotes = (filters: NoteFilters) => {
  return useGetNotesQuery({
    ...filters,
    isPublic: true,
  });
};

/**
 * Hook to get premium notes
 */
export const usePremiumNotes = (filters: NoteFilters) => {
  return useGetNotesQuery({
    ...filters,
    isPremium: true,
  });
};
