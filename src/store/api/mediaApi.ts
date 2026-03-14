// src/store/api/mediaApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface MediaAttachment {
  id: string;
  postId: string;
  url: string;
  type: string;
  category: string;
  filename: string;
  fileSize: number;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  thumbnail?: string | null;
  caption?: string | null;
  altText?: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface Post {
  id: string;
  title?: string | null;
  content?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  type: string;
  status: string;
  visibility: string;
  teacherId?: string | null;
  studentId?: string | null;
  batchId?: string | null;
  courseId?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkImage?: string | null;
  views: number;
  uniqueViews: number;
  shares: number;
  saves: number;
  tags: string[];
  topics: string[];
  isFeatured: boolean;
  isPinned: boolean;
  pinnedUntil?: string | null;
  pinnedBy?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords: string[];
  publishedAt?: string | null;
  scheduledFor?: string | null;
  reportedBy: string[];
  reportCount: number;
  hiddenReason?: string | null;
  hiddenBy?: string | null;
  hiddenAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
  } | null;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    class?: string | null;
  } | null;
  batch?: {
    id: string;
    name: string;
    subject: string;
  } | null;
  course?: {
    id: string;
    title: string;
    subject: string;
  } | null;
  media?: MediaAttachment[];
  poll?: Poll | null;
  _count?: {
    reactions: number;
    comments: number;
    bookmarks: number;
    views: number;
    shares: number;
  };
}

export interface PostReaction {
  id: string;
  postId: string;
  teacherId?: string | null;
  studentId?: string | null;
  guardianId?: string | null;
  type: string;
  createdAt: string;

  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  guardian?: {
    id: string;
    name: string;
  } | null;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId?: string | null;
  teacherId?: string | null;
  studentId?: string | null;
  guardianId?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  likes: number;
  reactionCount: number;
  status: string;
  isEdited: boolean;
  editHistory?: any;
  reportedBy: string[];
  reportCount: number;
  hiddenReason?: string | null;
  hiddenBy?: string | null;
  hiddenAt?: string | null;
  createdAt: string;
  updatedAt: string;

  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  guardian?: {
    id: string;
    name: string;
  } | null;
  replies?: Comment[];
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  commentId: string;
  teacherId?: string | null;
  studentId?: string | null;
  guardianId?: string | null;
  type: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  postId: string;
  question: string;
  options: any;
  multipleChoice: boolean;
  expiresAt?: string | null;
  isAnonymous: boolean;
  showResults: boolean;
  allowNewOptions: boolean;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
  votes?: PollVote[];
}

export interface PollVote {
  id: string;
  pollId: string;
  studentId?: string | null;
  teacherId?: string | null;
  guardianId?: string | null;
  selectedOptions: string[];
  ipAddress?: string | null;
  createdAt: string;
}

export interface PostBookmark {
  id: string;
  postId: string;
  studentId?: string | null;
  teacherId?: string | null;
  guardianId?: string | null;
  collectionId?: string | null;
  notes?: string | null;
  noteId?: string | null;
  createdAt: string;

  collection?: PostCollection | null;
  note?: any | null;
}

export interface PostCollection {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  studentId?: string | null;
  teacherId?: string | null;
  guardianId?: string | null;
  isPublic: boolean;
  shareableLink?: string | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarks?: PostBookmark[];
}

export interface PostView {
  id: string;
  postId: string;
  studentId?: string | null;
  teacherId?: string | null;
  guardianId?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  viewedAt: string;
  duration?: number | null;
}

export interface PostShare {
  id: string;
  postId: string;
  studentId?: string | null;
  teacherId?: string | null;
  guardianId?: string | null;
  platform?: string | null;
  sharedTo?: string | null;
  createdAt: string;
}

export interface PostFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  visibility?: string;
  authorId?: string;
  authorRole?: string;
  batchId?: string;
  courseId?: string;
  search?: string;
  tag?: string;
  topic?: string;
  isFeatured?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "views" | "reactions" | "comments";
  sortOrder?: "asc" | "desc";
}

export interface CreatePostData {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  type?: string;
  status?: string;
  visibility?: string;
  batchId?: string;
  courseId?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  tags?: string[];
  topics?: string[];
  isFeatured?: boolean;
  isPinned?: boolean;
  pinnedUntil?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  scheduledFor?: string;
  media?: Omit<MediaAttachment, "id" | "postId" | "createdAt">[];
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface CreateMediaData {
  url: string;
  type: string;
  category?: string;
  filename: string;
  fileSize: number;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  caption?: string;
  altText?: string;
  displayOrder?: number;
}

export interface CreateReactionData {
  type: string;
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface UpdateCommentData extends Partial<CreateCommentData> {}

export interface CreatePollData {
  question: string;
  options: any;
  multipleChoice?: boolean;
  expiresAt?: string;
  isAnonymous?: boolean;
  showResults?: boolean;
  allowNewOptions?: boolean;
}

export interface CreatePollVoteData {
  selectedOptions: string[];
}

export interface CreateBookmarkData {
  notes?: string;
  collectionId?: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {}

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

export interface ReactionSummary {
  [key: string]: number;
}

export interface PostReactionsResponse {
  reactions: PostReaction[];
  summary: ReactionSummary;
  total: number;
}

export interface MediaStats {
  total: number;
  published: number;
  draft: number;
  views: number;
  reactions: number;
  comments: number;
  popularTags: Array<{ tag: string; count: number }>;
  popularTopics: Array<{ topic: string; count: number }>;
  topAuthors: Array<{
    role: string;
    id: string;
    name: string;
    post_count: number;
  }>;
  engagementRate: number;
}

// ==================== API ENDPOINTS ====================

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== POST QUERIES ====================

    /**
     * Get paginated list of posts with filters
     */
    getPosts: builder.query<PaginatedResponse<Post>, PostFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/media?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    /**
     * Get single post by ID
     */
    getPostById: builder.query<Post, string>({
      query: (id) => `/media/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
      transformResponse: (response: { data: Post }) => response.data,
    }),

    /**
     * Get post statistics
     */
    getMediaStats: builder.query<{ data: MediaStats }, void>({
      query: () => "/media/stats",
      providesTags: ["MediaStats"],
    }),

    // ==================== MEDIA QUERIES ====================

    /**
     * Get all media attachments for a post
     */
    getPostMedia: builder.query<MediaAttachment[], string>({
      query: (postId) => `/media/${postId}/media`,
      providesTags: (result, error, postId) => [
        { type: "PostMedia", id: postId },
      ],
      transformResponse: (response: { data: MediaAttachment[] }) =>
        response.data,
    }),

    // ==================== REACTION QUERIES ====================

    /**
     * Get all reactions for a post
     */
    getPostReactions: builder.query<PostReactionsResponse, string>({
      query: (postId) => `/media/${postId}/reactions`,
      providesTags: (result, error, postId) => [
        { type: "PostReactions", id: postId },
      ],
      transformResponse: (response: { data: PostReactionsResponse }) =>
        response.data,
    }),

    // ==================== COMMENT QUERIES ====================

    /**
     * Get all comments for a post
     */
    getPostComments: builder.query<Comment[], string>({
      query: (postId) => `/media/${postId}/comments`,
      providesTags: (result, error, postId) => [
        { type: "PostComments", id: postId },
      ],
      transformResponse: (response: { data: Comment[] }) => response.data,
    }),

    // ==================== BOOKMARK QUERIES ====================

    /**
     * Get user's bookmarks
     */
    getUserBookmarks: builder.query<PostBookmark[], void>({
      query: () => "/media/bookmarks",
      providesTags: ["UserBookmarks"],
      transformResponse: (response: { data: PostBookmark[] }) => response.data,
    }),

    /**
     * Get user's collections
     */
    getUserCollections: builder.query<PostCollection[], void>({
      query: () => "/media/collections",
      providesTags: ["UserCollections"],
      transformResponse: (response: { data: PostCollection[] }) =>
        response.data,
    }),

    // ==================== POST MUTATIONS ====================

    /**
     * Create a new post
     */
    createPost: builder.mutation<Post, CreatePostData>({
      query: (data) => ({
        url: "/media",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }, "MediaStats"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to create post",
        errors: response?.data?.errors || [],
      }),
    }),

    /**
     * Update an existing post
     */
    updatePost: builder.mutation<Post, { id: string; data: UpdatePostData }>({
      query: ({ id, data }) => ({
        url: `/media/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "MediaStats",
      ],
    }),

    /**
     * Delete a post
     */
    deletePost: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/media/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Post", id },
          { type: "Post", id: "LIST" },
          "MediaStats",
        ],
      },
    ),

    /**
     * Publish a post
     */
    publishPost: builder.mutation<Post, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "PATCH",
        body: { status: "PUBLISHED" },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "MediaStats",
      ],
    }),

    /**
     * Feature a post
     */
    featurePost: builder.mutation<Post, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "PATCH",
        body: { isFeatured: true },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
      ],
    }),

    /**
     * Pin a post
     */
    pinPost: builder.mutation<Post, { id: string; pinnedUntil?: string }>({
      query: ({ id, pinnedUntil }) => ({
        url: `/media/${id}`,
        method: "PATCH",
        body: { isPinned: true, pinnedUntil },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
      ],
    }),

    // ==================== MEDIA MUTATIONS ====================

    /**
     * Add media to post
     */
    addPostMedia: builder.mutation<
      MediaAttachment[],
      { postId: string; data: CreateMediaData[] }
    >({
      query: ({ postId, data }) => ({
        url: `/media/${postId}/media`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostMedia", id: postId },
      ],
    }),

    /**
     * Update media attachment
     */
    updateMedia: builder.mutation<
      MediaAttachment,
      { postId: string; mediaId: string; data: Partial<CreateMediaData> }
    >({
      query: ({ postId, mediaId, data }) => ({
        url: `/media/${postId}/media/${mediaId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { postId, mediaId }) => [
        { type: "Post", id: postId },
        { type: "PostMedia", id: postId },
      ],
    }),

    /**
     * Delete media attachment
     */
    deleteMedia: builder.mutation<
      { success: boolean; message: string },
      { postId: string; mediaId: string }
    >({
      query: ({ postId, mediaId }) => ({
        url: `/media/${postId}/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostMedia", id: postId },
      ],
    }),

    // ==================== REACTION MUTATIONS ====================

    /**
     * Add or update reaction
     */
    addReaction: builder.mutation<
      PostReaction,
      { postId: string; data: CreateReactionData }
    >({
      query: ({ postId, data }) => ({
        url: `/media/${postId}/reactions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostReactions", id: postId },
      ],
    }),

    /**
     * Remove reaction
     */
    removeReaction: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (postId) => ({
        url: `/media/${postId}/reactions`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "PostReactions", id: postId },
      ],
    }),

    // ==================== COMMENT MUTATIONS ====================

    /**
     * Add comment to post
     */
    addComment: builder.mutation<
      Comment,
      { postId: string; data: CreateCommentData }
    >({
      query: ({ postId, data }) => ({
        url: `/media/${postId}/comments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostComments", id: postId },
      ],
    }),

    /**
     * Update comment
     */
    updateComment: builder.mutation<
      Comment,
      { postId: string; commentId: string; data: UpdateCommentData }
    >({
      query: ({ postId, commentId, data }) => ({
        url: `/media/${postId}/comments/${commentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { postId, commentId }) => [
        { type: "Post", id: postId },
        { type: "PostComments", id: postId },
      ],
    }),

    /**
     * Delete comment
     */
    deleteComment: builder.mutation<
      { success: boolean; message: string },
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `/media/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "PostComments", id: postId },
      ],
    }),

    /**
     * Like comment
     */
    likeComment: builder.mutation<
      CommentReaction,
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `/media/${postId}/comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { postId, commentId }) => [
        { type: "Post", id: postId },
        { type: "PostComments", id: postId },
      ],
    }),

    // ==================== BOOKMARK MUTATIONS ====================

    /**
     * Bookmark a post
     */
    bookmarkPost: builder.mutation<
      PostBookmark,
      { postId: string; data?: CreateBookmarkData }
    >({
      query: ({ postId, data }) => ({
        url: `/media/${postId}/bookmark`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        "UserBookmarks",
      ],
    }),

    /**
     * Remove bookmark
     */
    removeBookmark: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (postId) => ({
        url: `/media/${postId}/bookmark`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        "UserBookmarks",
      ],
    }),

    // ==================== COLLECTION MUTATIONS ====================

    /**
     * Create collection
     */
    createCollection: builder.mutation<PostCollection, CreateCollectionData>({
      query: (data) => ({
        url: "/media/collections",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserCollections"],
    }),

    /**
     * Update collection
     */
    updateCollection: builder.mutation<
      PostCollection,
      { id: string; data: UpdateCollectionData }
    >({
      query: ({ id, data }) => ({
        url: `/media/collections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserCollections"],
    }),

    /**
     * Delete collection
     */
    deleteCollection: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/media/collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserCollections"],
    }),

    /**
     * Add post to collection
     */
    addToCollection: builder.mutation<
      PostBookmark,
      { collectionId: string; postId: string; notes?: string }
    >({
      query: ({ collectionId, postId, notes }) => ({
        url: `/media/collections/${collectionId}/add`,
        method: "POST",
        body: { postId, notes },
      }),
      invalidatesTags: (result, error, { collectionId, postId }) => [
        { type: "Post", id: postId },
        "UserCollections",
        "UserBookmarks",
      ],
    }),

    /**
     * Remove from collection
     */
    removeFromCollection: builder.mutation<
      { success: boolean; message: string },
      { collectionId: string; postId: string }
    >({
      query: ({ collectionId, postId }) => ({
        url: `/media/collections/${collectionId}/remove`,
        method: "POST",
        body: { postId },
      }),
      invalidatesTags: (result, error, { collectionId, postId }) => [
        { type: "Post", id: postId },
        "UserCollections",
        "UserBookmarks",
      ],
    }),

    // ==================== POLL MUTATIONS ====================

    /**
     * Create poll in post
     */
    createPoll: builder.mutation<
      Poll,
      { postId: string; data: CreatePollData }
    >({
      query: ({ postId, data }) => ({
        url: `/media/${postId}/poll`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    /**
     * Vote in poll
     */
    votePoll: builder.mutation<
      PollVote,
      { postId: string; data: CreatePollVoteData }
    >({
      query: ({ postId, data }) => ({
        url: `/media/${postId}/poll/vote`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk operations on posts
     */
    bulkPostAction: builder.mutation<
      { success: boolean; count: number },
      {
        postIds: string[];
        action:
          | "publish"
          | "unpublish"
          | "feature"
          | "unfeature"
          | "pin"
          | "unpin"
          | "delete";
      }
    >({
      query: (data) => ({
        url: "/media/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }, "MediaStats"],
    }),
  }),
});

// ==================== HOOKS ====================

// Post hooks
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetMediaStatsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePublishPostMutation,
  useFeaturePostMutation,
  usePinPostMutation,
} = mediaApi;

// Media hooks
export const {
  useGetPostMediaQuery,
  useAddPostMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;

// Reaction hooks
export const {
  useGetPostReactionsQuery,
  useAddReactionMutation,
  useRemoveReactionMutation,
} = mediaApi;

// Comment hooks
export const {
  useGetPostCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
} = mediaApi;

// Bookmark hooks
export const {
  useGetUserBookmarksQuery,
  useBookmarkPostMutation,
  useRemoveBookmarkMutation,
} = mediaApi;

// Collection hooks
export const {
  useGetUserCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddToCollectionMutation,
  useRemoveFromCollectionMutation,
} = mediaApi;

// Poll hooks
export const { useCreatePollMutation, useVotePollMutation } = mediaApi;

// Bulk operations hooks
export const { useBulkPostActionMutation } = mediaApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch post data
 */
export const usePrefetchPost = () => {
  const api = mediaApi.usePrefetch("getPostById");
  return (id: string) => api(id);
};

/**
 * Hook to get posts with auto-refresh
 */
export const usePostsWithAutoRefresh = (filters: PostFilters) => {
  return useGetPostsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};
