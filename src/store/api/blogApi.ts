// src/store/api/blogApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  teacherId: string;
  featuredImage?: string | null;
  thumbnail?: string | null;
  gallery: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords: string[];
  views: number;
  likes: number;
  shares: number;
  readTime?: number | null;
  isPublished: boolean;
  publishedAt?: string | null;
  categories: string[];
  tags: string[];
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
    bio?: string | null;
    expertise: string[];
  };
  comments?: BlogComment[];
  _count?: {
    comments: number;
  };
}

export interface BlogComment {
  id: string;
  blogId: string;
  name?: string | null;
  email?: string | null;
  content: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  teacherId?: string;
  isPublished?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: "title" | "createdAt" | "publishedAt" | "views" | "likes";
  sortOrder?: "asc" | "desc";
}

export interface CreateBlogData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  teacherId?: string;
  featuredImage?: string;
  thumbnail?: string;
  gallery?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  categories?: string[];
  tags?: string[];
  isPublished?: boolean;
  allowComments?: boolean;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {}

export interface CreateCommentData {
  name?: string;
  email?: string;
  content: string;
}

export interface UpdateCommentData {
  content?: string;
  status?: string;
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

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  views: number;
  comments: number;
  pendingComments: number;
  popularCategories: Array<{ category: string; count: number }>;
  popularTags: Array<{ tag: string; count: number }>;
  topAuthors: Array<{
    id: string;
    name: string;
    blog_count: number;
    total_views: number;
  }>;
  publishRate: number;
}

export interface CommentStats {
  total: number;
  approved: number;
  pending: number;
  spam: number;
}

// ==================== API ENDPOINTS ====================

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== BLOG QUERIES ====================

    /**
     * Get paginated list of blogs with filters
     */
    getBlogs: builder.query<PaginatedResponse<Blog>, BlogFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/blogs?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Blog" as const, id })),
              { type: "Blog", id: "LIST" },
            ]
          : [{ type: "Blog", id: "LIST" }],
    }),

    /**
     * Get single blog by ID or slug
     */
    getBlogById: builder.query<Blog, string>({
      query: (id) => `/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
      transformResponse: (response: { data: Blog }) => response.data,
    }),

    /**
     * Get blog by slug
     */
    getBlogBySlug: builder.query<Blog, string>({
      query: (slug) => `/blogs/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
      transformResponse: (response: { data: Blog }) => response.data,
    }),

    /**
     * Get blog statistics
     */
    getBlogStats: builder.query<{ data: BlogStats }, void>({
      query: () => "/blogs/stats",
      providesTags: ["BlogStats"],
    }),

    // ==================== COMMENT QUERIES ====================

    /**
     * Get comments for a blog
     */
    getBlogComments: builder.query<
      PaginatedResponse<BlogComment>,
      { blogId: string; page?: number; limit?: number; status?: string }
    >({
      query: ({ blogId, page = 1, limit = 20, status }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (status) params.append("status", status);

        return {
          url: `/blogs/${blogId}/comments?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { blogId }) => [
        { type: "BlogComments", id: blogId },
      ],
    }),

    /**
     * Get comment statistics
     */
    getCommentStats: builder.query<{ data: CommentStats }, void>({
      query: () => "/blogs/comments/stats",
      providesTags: ["CommentStats"],
    }),

    // ==================== BLOG MUTATIONS ====================

    /**
     * Create a new blog
     */
    createBlog: builder.mutation<Blog, CreateBlogData>({
      query: (data) => ({
        url: "/blogs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }, "BlogStats"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to create blog",
        errors: response?.data?.errors || [],
      }),
    }),

    /**
     * Update an existing blog
     */
    updateBlog: builder.mutation<Blog, { id: string; data: UpdateBlogData }>({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
        "BlogStats",
      ],
    }),

    /**
     * Delete a blog
     */
    deleteBlog: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/blogs/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Blog", id },
          { type: "Blog", id: "LIST" },
          "BlogStats",
        ],
      },
    ),

    /**
     * Publish a blog
     */
    publishBlog: builder.mutation<Blog, string>({
      query: (id) => ({
        url: `/blogs/${id}/publish`,
        method: "PATCH",
        body: { isPublished: true },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
        "BlogStats",
      ],
    }),

    /**
     * Unpublish a blog
     */
    unpublishBlog: builder.mutation<Blog, string>({
      query: (id) => ({
        url: `/blogs/${id}/publish`,
        method: "PATCH",
        body: { isPublished: false },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
        "BlogStats",
      ],
    }),

    /**
     * Increment blog likes
     */
    likeBlog: builder.mutation<Blog, string>({
      query: (id) => ({
        url: `/blogs/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    /**
     * Increment blog shares
     */
    shareBlog: builder.mutation<Blog, string>({
      query: (id) => ({
        url: `/blogs/${id}/share`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    // ==================== COMMENT MUTATIONS ====================

    /**
     * Add comment to blog
     */
    addComment: builder.mutation<
      BlogComment,
      { blogId: string; data: CreateCommentData }
    >({
      query: ({ blogId, data }) => ({
        url: `/blogs/${blogId}/comments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Blog", id: blogId },
        { type: "BlogComments", id: blogId },
        "CommentStats",
      ],
    }),

    /**
     * Update a comment
     */
    updateComment: builder.mutation<
      BlogComment,
      { blogId: string; commentId: string; data: UpdateCommentData }
    >({
      query: ({ blogId, commentId, data }) => ({
        url: `/blogs/${blogId}/comments/${commentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { blogId, commentId }) => [
        { type: "Blog", id: blogId },
        { type: "BlogComments", id: blogId },
      ],
    }),

    /**
     * Delete a comment
     */
    deleteComment: builder.mutation<
      { success: boolean; message: string },
      { blogId: string; commentId: string }
    >({
      query: ({ blogId, commentId }) => ({
        url: `/blogs/${blogId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Blog", id: blogId },
        { type: "BlogComments", id: blogId },
        "CommentStats",
      ],
    }),

    /**
     * Approve a comment
     */
    approveComment: builder.mutation<
      BlogComment,
      { blogId: string; commentId: string }
    >({
      query: ({ blogId, commentId }) => ({
        url: `/blogs/${blogId}/comments/${commentId}/approve`,
        method: "PATCH",
        body: { approve: true },
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Blog", id: blogId },
        { type: "BlogComments", id: blogId },
        "CommentStats",
      ],
    }),

    /**
     * Reject a comment
     */
    rejectComment: builder.mutation<
      BlogComment,
      { blogId: string; commentId: string }
    >({
      query: ({ blogId, commentId }) => ({
        url: `/blogs/${blogId}/comments/${commentId}/approve`,
        method: "PATCH",
        body: { approve: false },
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Blog", id: blogId },
        { type: "BlogComments", id: blogId },
        "CommentStats",
      ],
    }),

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk operations on blogs
     */
    bulkBlogAction: builder.mutation<
      { success: boolean; count: number },
      { blogIds: string[]; action: "publish" | "unpublish" | "delete" }
    >({
      query: (data) => ({
        url: "/blogs/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }, "BlogStats"],
    }),

    /**
     * Bulk operations on comments
     */
    bulkCommentAction: builder.mutation<
      { success: boolean; count: number },
      { commentIds: string[]; action: "approve" | "reject" | "delete" }
    >({
      query: (data) => ({
        url: "/blogs/comments/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CommentStats"],
    }),
  }),
});

// ==================== HOOKS ====================

// Blog hooks
export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useGetBlogBySlugQuery,
  useGetBlogStatsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  usePublishBlogMutation,
  useUnpublishBlogMutation,
  useLikeBlogMutation,
  useShareBlogMutation,
} = blogApi;

// Comment hooks
export const {
  useGetBlogCommentsQuery,
  useGetCommentStatsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useApproveCommentMutation,
  useRejectCommentMutation,
} = blogApi;

// Bulk operations hooks
export const { useBulkBlogActionMutation, useBulkCommentActionMutation } =
  blogApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch blog data
 */
export const usePrefetchBlog = () => {
  const api = blogApi.usePrefetch("getBlogById");
  return (id: string) => api(id);
};

/**
 * Hook to get blogs with auto-refresh
 */
export const useBlogsWithAutoRefresh = (filters: BlogFilters) => {
  return useGetBlogsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get blog comments with auto-refresh
 */
export const useCommentsWithAutoRefresh = (blogId: string, status?: string) => {
  return useGetBlogCommentsQuery(
    { blogId, status },
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
};
