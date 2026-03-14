// src/app/dashboard/admin/media/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  Image,
  Video,
  Link2,
  File,
  X,
  Award,
  Users,
  Download,
  Upload,
  BarChart,
  TrendingUp,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Printer,
  Mail,
  Send,
  Copy,
  Star,
  Target,
  Activity,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Pin,
  Flag,
  Hash,
  Tag,
  Calendar,
  Globe,
  Lock,
  EyeOff,
  Camera,
  Music,
  Headphones,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FilePdf,
} from "lucide-react";

import {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetMediaStatsQuery,
  useGetPostMediaQuery,
  useGetPostCommentsQuery,
  useGetPostReactionsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePublishPostMutation,
  useFeaturePostMutation,
  usePinPostMutation,
  useAddPostMediaMutation,
  useDeleteMediaMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useBookmarkPostMutation,
  useRemoveBookmarkMutation,
  useBulkPostActionMutation,
} from "@/store/api/mediaApi";
import { useGetBatchesQuery, useGetCoursesQuery } from "@/store/api/batchApi";
// import { useGetCoursesQuery } from "@/store/api/courseApi";

// Types
interface Post {
  id: string;
  title?: string | null;
  content?: string | null;
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
  shares: number;
  saves: number;
  tags: string[];
  topics: string[];
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt?: string | null;
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
  batch?: {
    id: string;
    name: string;
    subject: string;
  } | null;
  media?: any[];
  _count?: {
    reactions: number;
    comments: number;
    bookmarks: number;
  };
}

interface MediaAttachment {
  id: string;
  url: string;
  type: string;
  category: string;
  filename: string;
  fileSize: number;
  caption?: string | null;
  displayOrder: number;
}

interface Filters {
  search: string;
  type: string;
  status: string;
  visibility: string;
  batchId: string;
  courseId: string;
  tag: string;
}

const MediaManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [mediaModal, setMediaModal] = useState(false);
  const [commentsModal, setCommentsModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    status: "",
    visibility: "",
    batchId: "",
    courseId: "",
    tag: "",
  });
  const [commentContent, setCommentContent] = useState("");

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useGetPostsQuery({
    page,
    limit,
    search: filters.search || undefined,
    type: filters.type || undefined,
    status: filters.status || undefined,
    visibility: filters.visibility || undefined,
    batchId: filters.batchId || undefined,
    courseId: filters.courseId || undefined,
    tag: filters.tag || undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetMediaStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singlePost, refetch: refetchPost } = useGetPostByIdQuery(
    selectedPost?.id || "",
    { skip: !selectedPost?.id },
  );

  const { data: postMedia, refetch: refetchMedia } = useGetPostMediaQuery(
    selectedPost?.id || "",
    { skip: !selectedPost?.id },
  );

  const { data: postComments, refetch: refetchComments } =
    useGetPostCommentsQuery(selectedPost?.id || "", {
      skip: !selectedPost?.id,
    });

  const { data: batchesData } = useGetBatchesQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const { data: coursesData } = useGetCoursesQuery({
    page: 1,
    limit: 100,
  });

  const posts = postsData?.data || [];
  const meta = postsData?.meta;
  const batches = batchesData?.data || [];
  const courses = coursesData?.data || [];

  /* ===============================
  MUTATIONS
  =============================== */

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [publishPost, { isLoading: isPublishing }] = usePublishPostMutation();
  const [featurePost, { isLoading: isFeaturing }] = useFeaturePostMutation();
  const [pinPost, { isLoading: isPinning }] = usePinPostMutation();
  const [addPostMedia, { isLoading: isAddingMedia }] =
    useAddPostMediaMutation();
  const [deleteMedia, { isLoading: isDeletingMedia }] =
    useDeleteMediaMutation();
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [bookmarkPost] = useBookmarkPostMutation();
  const [removeBookmark] = useRemoveBookmarkMutation();
  const [bulkAction, { isLoading: isBulkAction }] = useBulkPostActionMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singlePost && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singlePost, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (post: Post) => {
    setSelectedPost(post);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (post: Post) => {
    const result = await Swal.fire({
      title: "Delete Post?",
      text: `Are you sure you want to delete "${post.title || "Untitled"}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await deletePost(post.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Post has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedPost?.id === post.id) {
          setSelectedPost(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete post",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishPost(id).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Post published successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to publish post",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleFeature = async (id: string) => {
    try {
      await featurePost(id).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Post featured successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetch();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to feature post",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handlePin = async (id: string) => {
    try {
      await pinPost({ id }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Post pinned successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetch();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to pin post",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleBookmark = async (id: string) => {
    try {
      await bookmarkPost({ postId: id }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Post bookmarked.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
    } catch (error: any) {
      console.error("Failed to bookmark:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !commentContent.trim()) return;

    try {
      await addComment({
        postId: selectedPost.id,
        data: { content: commentContent },
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Comment added successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setCommentContent("");
      refetchComments();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to add comment",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost) return;

    const result = await Swal.fire({
      title: "Delete Comment?",
      text: "Are you sure you want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await deleteComment({
          postId: selectedPost.id,
          commentId,
        }).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Comment deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchComments();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete comment",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleBulkAction = async (
    action:
      | "publish"
      | "unpublish"
      | "feature"
      | "unfeature"
      | "pin"
      | "unpin"
      | "delete",
  ) => {
    if (!selectedPosts.length) {
      Swal.fire({
        title: "No posts selected",
        text: "Please select at least one post",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}d`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedPosts.length} posts?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "delete" ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}`,
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await bulkAction({
          postIds: selectedPosts,
          action,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedPosts.length} posts ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedPosts([]);
        setSelectAll(false);
        refetch();
        refetchStats();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} posts`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleSelect = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((s) => s !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((p: Post) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleCreatePost = async (data: any) => {
    try {
      await createPost(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Post created successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setCreateModal(false);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to create post",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdatePost = async (id: string, data: any) => {
    try {
      await updatePost({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Post updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedPost(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update post",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleAddMedia = async (files: File[]) => {
    if (!selectedPost) return;

    // This would need a file upload endpoint
    // For now, just show a message
    Swal.fire({
      title: "Coming Soon",
      text: "Media upload functionality will be added soon.",
      icon: "info",
      background: "#1f2937",
      color: "#fff",
    });
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!selectedPost) return;

    const result = await Swal.fire({
      title: "Delete Media?",
      text: "Are you sure you want to delete this media?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await deleteMedia({
          postId: selectedPost.id,
          mediaId,
        }).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Media deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchMedia();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete media",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      status: "",
      visibility: "",
      batchId: "",
      courseId: "",
      tag: "",
    });
    setPage(1);
  };

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <Image className="w-4 h-4" />;
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "AUDIO":
        return <Headphones className="w-4 h-4" />;
      case "PDF":
        return <FilePdf className="w-4 h-4" />;
      case "LINK":
        return <Link2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      case "REPORTED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  // Get visibility icon
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return <Globe className="w-3 h-3" />;
      case "STUDENTS_ONLY":
        return <Users className="w-3 h-3" />;
      case "BATCH_ONLY":
        return <BookOpen className="w-3 h-3" />;
      case "TEACHERS_ONLY":
        return <GraduationCap className="w-3 h-3" />;
      case "PRIVATE":
        return <Lock className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-400" />
          Media Management
        </h1>
        <p className="text-gray-400">
          Create and manage posts, media, and content
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Posts</h3>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Published</h3>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.published || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Views</h3>
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.views?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Engagement</h3>
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.engagementRate || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
            <button
              onClick={() => setBulkActionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              disabled={selectedPosts.length === 0}
            >
              <FileText className="w-4 h-4" />
              Bulk Actions ({selectedPosts.length})
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-gray-300 font-medium flex items-center gap-2 hover:bg-gray-700 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => {
                refetch();
                refetchStats();
              }}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-gray-300 font-medium flex items-center gap-2 hover:bg-gray-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => {
                    setFilters({ ...filters, type: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="TEXT">Text</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="PDF">PDF</option>
                  <option value="LINK">Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibility
                </label>
                <select
                  value={filters.visibility}
                  onChange={(e) => {
                    setFilters({ ...filters, visibility: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="PUBLIC">Public</option>
                  <option value="STUDENTS_ONLY">Students Only</option>
                  <option value="BATCH_ONLY">Batch Only</option>
                  <option value="TEACHERS_ONLY">Teachers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Batch
                </label>
                <select
                  value={filters.batchId}
                  onChange={(e) => {
                    setFilters({ ...filters, batchId: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  {batches.map((batch: any) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course
                </label>
                <select
                  value={filters.courseId}
                  onChange={(e) => {
                    setFilters({ ...filters, courseId: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  {courses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  value={filters.tag}
                  onChange={(e) => {
                    setFilters({ ...filters, tag: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., physics"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedPosts.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedPosts.length}</span> posts
            selected
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleBulkAction("publish")}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction("feature")}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
            >
              Feature
            </button>
            <button
              onClick={() => handleBulkAction("pin")}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
            >
              Pin
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load posts</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectAll && posts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Post
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Author
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Type
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Visibility
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Stats
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Created
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post: Post) => (
                    <tr
                      key={post.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(post)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => handleSelect(post.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {post.media && post.media.length > 0 ? (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                              {post.media[0].category === "IMAGE" ? (
                                <img
                                  src={post.media[0].url}
                                  alt={post.title || "Post"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getTypeIcon(post.media[0].category)
                              )}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              {getTypeIcon(post.type)}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {post.title || "Untitled"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {post.excerpt?.substring(0, 50) || "No excerpt"}
                              ...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {post.teacher?.name?.charAt(0) ||
                                post.student?.name?.charAt(0) ||
                                "A"}
                            </span>
                          </div>
                          <span className="text-white text-sm">
                            {post.teacher?.name ||
                              post.student?.name ||
                              "Admin"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {getTypeIcon(post.type)}
                          {post.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}
                        >
                          {post.status === "PUBLISHED" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {post.status === "DRAFT" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {post.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          {getVisibilityIcon(post.visibility)}
                          {post.visibility.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <ThumbsUp className="w-3 h-3" />
                            {post._count?.reactions || 0}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageCircle className="w-3 h-3" />
                            {post._count?.comments || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === "DRAFT" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublish(post.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Publish"
                              disabled={isPublishing}
                            >
                              <Send className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          {!post.isFeatured && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeature(post.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Feature"
                              disabled={isFeaturing}
                            >
                              <Star className="w-4 h-4 text-yellow-400" />
                            </button>
                          )}
                          {!post.isPinned && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePin(post.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Pin"
                              disabled={isPinning}
                            >
                              <Pin className="w-4 h-4 text-purple-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                              setMediaModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Manage Media"
                          >
                            <Image className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                              setCommentsModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Comments"
                          >
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                              setEditModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-400"
                            title="Delete"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
                  posts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-300">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {createModal && (
        <PostModal
          mode="create"
          batches={batches}
          courses={courses}
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreatePost}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedPost && (
        <PostModal
          mode="edit"
          post={selectedPost}
          batches={batches}
          courses={courses}
          onClose={() => {
            setEditModal(false);
            setSelectedPost(null);
          }}
          onSubmit={(data) => handleUpdatePost(selectedPost.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedPost && (
        <ViewPostModal
          post={singlePost || selectedPost}
          media={postMedia || []}
          comments={postComments || []}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedPost(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onManageMedia={() => {
            setViewModal(false);
            setMediaModal(true);
          }}
          onViewComments={() => {
            setViewModal(false);
            setCommentsModal(true);
          }}
          onPublish={handlePublish}
          onFeature={handleFeature}
          onPin={handlePin}
          onBookmark={handleBookmark}
        />
      )}

      {mediaModal && selectedPost && (
        <MediaModal
          post={selectedPost}
          media={postMedia || []}
          onClose={() => {
            setMediaModal(false);
            setSelectedPost(null);
          }}
          onAddMedia={handleAddMedia}
          onDeleteMedia={handleDeleteMedia}
          isLoading={isAddingMedia || isDeletingMedia}
        />
      )}

      {commentsModal && selectedPost && (
        <CommentsModal
          post={selectedPost}
          comments={postComments || []}
          onClose={() => {
            setCommentsModal(false);
            setSelectedPost(null);
          }}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={likeComment}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          isLoading={isAddingComment}
        />
      )}

      {bulkActionModal && (
        <BulkActionModal
          selectedCount={selectedPosts.length}
          onClose={() => setBulkActionModal(false)}
          onAction={handleBulkAction}
          isLoading={isBulkAction}
        />
      )}
    </div>
  );
};

export default MediaManagement;

// =============================================
// POST MODAL (Create/Edit)
// =============================================

interface PostModalProps {
  mode: "create" | "edit";
  post?: Post | null;
  batches: any[];
  courses: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const PostModal = ({
  mode,
  post,
  batches,
  courses,
  onClose,
  onSubmit,
  isLoading,
}: PostModalProps) => {
  const [form, setForm] = useState({
    title: post?.title || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    type: post?.type || "TEXT",
    status: post?.status || "DRAFT",
    visibility: post?.visibility || "PUBLIC",
    batchId: post?.batchId || "",
    courseId: post?.courseId || "",
    linkUrl: post?.linkUrl || "",
    linkTitle: post?.linkTitle || "",
    linkDescription: post?.linkDescription || "",
    linkImage: post?.linkImage || "",
    tags: post?.tags?.join(", ") || "",
    topics: post?.topics?.join(", ") || "",
    isFeatured: post?.isFeatured || false,
    isPinned: post?.isPinned || false,
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    metaKeywords: post?.metaKeywords?.join(", ") || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      topics: form.topics
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      metaKeywords: form.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      batchId: form.batchId || undefined,
      courseId: form.courseId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Enter post title"
            />
          </div>

          {/* Type, Status, Visibility */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="PDF">PDF</option>
                <option value="LINK">Link</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visibility
              </label>
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="PUBLIC">Public</option>
                <option value="STUDENTS_ONLY">Students Only</option>
                <option value="BATCH_ONLY">Batch Only</option>
                <option value="TEACHERS_ONLY">Teachers Only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Batch and Course (Conditional) */}
          {(form.visibility === "BATCH_ONLY" ||
            form.visibility === "STUDENTS_ONLY") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Batch
                </label>
                <select
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} - {batch.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course
                </label>
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt (Short description)
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Brief description of the post..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white font-mono"
              placeholder="Write your post content here... (supports HTML/markdown)"
            />
          </div>

          {/* Link Fields (if type is LINK) */}
          {form.type === "LINK" && (
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-white font-medium">Link Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  name="linkUrl"
                  value={form.linkUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link Title
                </label>
                <input
                  type="text"
                  name="linkTitle"
                  value={form.linkTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="Title of the linked content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link Description
                </label>
                <textarea
                  name="linkDescription"
                  value={form.linkDescription}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="Description of the linked content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link Image URL
                </label>
                <input
                  type="url"
                  name="linkImage"
                  value={form.linkImage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          )}

          {/* Tags and Topics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="physics, quantum, mechanics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topics (comma separated)
              </label>
              <input
                type="text"
                name="topics"
                value={form.topics}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="quantum physics, waves, optics"
              />
            </div>
          </div>

          {/* Featured and Pinned */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Feature this post</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPinned"
                checked={form.isPinned}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Pin this post</span>
            </label>
          </div>

          {/* SEO Section */}
          <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-white font-medium">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="SEO title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="SEO description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Keywords (comma separated)
              </label>
              <input
                type="text"
                name="metaKeywords"
                value={form.metaKeywords}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="physics, education, learning"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Post"
                  : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW POST MODAL
// =============================================

interface ViewPostModalProps {
  post: Post;
  media: MediaAttachment[];
  comments: any[];
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onManageMedia: () => void;
  onViewComments: () => void;
  onPublish: (id: string) => void;
  onFeature: (id: string) => void;
  onPin: (id: string) => void;
  onBookmark: (id: string) => void;
}

const ViewPostModal = ({
  post,
  media,
  comments,
  isLoading,
  onClose,
  onEdit,
  onManageMedia,
  onViewComments,
  onPublish,
  onFeature,
  onPin,
  onBookmark,
}: ViewPostModalProps) => {
  const [activeTab, setActiveTab] = useState<"content" | "media" | "comments">(
    "content",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return <Globe className="w-4 h-4" />;
      case "STUDENTS_ONLY":
        return <Users className="w-4 h-4" />;
      case "BATCH_ONLY":
        return <BookOpen className="w-4 h-4" />;
      case "TEACHERS_ONLY":
        return <GraduationCap className="w-4 h-4" />;
      case "PRIVATE":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white text-lg">Loading post details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Post Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              {post.type === "IMAGE" ? (
                <Image className="w-8 h-8 text-white" />
              ) : post.type === "VIDEO" ? (
                <Video className="w-8 h-8 text-white" />
              ) : post.type === "AUDIO" ? (
                <Headphones className="w-8 h-8 text-white" />
              ) : post.type === "PDF" ? (
                <FilePdf className="w-8 h-8 text-white" />
              ) : post.type === "LINK" ? (
                <Link2 className="w-8 h-8 text-white" />
              ) : (
                <FileText className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">
                {post.title || "Untitled"}
              </h3>
              <p className="text-gray-400">{post.excerpt || "No excerpt"}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}
                >
                  {post.status}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  {getVisibilityIcon(post.visibility)}
                  {post.visibility.replace("_", " ")}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  {post.type}
                </span>
                {post.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {post.isPinned && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {post.status === "DRAFT" && (
                <button
                  onClick={() => onPublish(post.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Publish
                </button>
              )}
              {!post.isFeatured && (
                <button
                  onClick={() => onFeature(post.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Feature
                </button>
              )}
              {!post.isPinned && (
                <button
                  onClick={() => onPin(post.id)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Pin
                </button>
              )}
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Author Info */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-lg font-medium text-white">
                {post.teacher?.name?.charAt(0) ||
                  post.student?.name?.charAt(0) ||
                  "A"}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">
                {post.teacher?.name || post.student?.name || "Admin"}
              </p>
              <p className="text-sm text-gray-400">
                {post.teacher ? "Teacher" : post.student ? "Student" : "Admin"}{" "}
                • Created: {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{post.views}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <ThumbsUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">
                {post._count?.reactions || 0}
              </p>
              <p className="text-xs text-gray-400">Reactions</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-center">
              <MessageCircle className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">
                {post._count?.comments || 0}
              </p>
              <p className="text-xs text-gray-400">Comments</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
              <Bookmark className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">
                {post._count?.bookmarks || 0}
              </p>
              <p className="text-xs text-gray-400">Saves</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "content"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "media"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Media ({media.length})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "comments"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              {post.linkUrl && (
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Link Attachment</p>
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    {post.linkTitle || post.linkUrl}
                  </a>
                  {post.linkDescription && (
                    <p className="text-sm text-gray-400 mt-2">
                      {post.linkDescription}
                    </p>
                  )}
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <h4 className="text-white font-medium mb-2">Content</h4>
                <div className="text-gray-300 whitespace-pre-wrap bg-gray-800/30 p-4 rounded-lg">
                  {post.content || "No content"}
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {post.topics && post.topics.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">Attached Media</h4>
                <button
                  onClick={onManageMedia}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Manage Media
                </button>
              </div>
              {media.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No media attached
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-800/50 rounded-lg p-3"
                    >
                      {item.category === "IMAGE" ? (
                        <img
                          src={item.url}
                          alt={item.caption || "Media"}
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                      ) : item.category === "VIDEO" ? (
                        <video
                          src={item.url}
                          controls
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                          <File className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <p className="text-white text-sm truncate">
                        {item.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.caption || "No caption"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">Comments</h4>
                <button
                  onClick={onViewComments}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Manage Comments
                </button>
              </div>
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No comments yet
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.slice(0, 5).map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {comment.student?.name?.charAt(0) ||
                              comment.teacher?.name?.charAt(0) ||
                              "U"}
                          </span>
                        </div>
                        <span className="text-white text-sm font-medium">
                          {comment.student?.name ||
                            comment.teacher?.name ||
                            "User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length > 5 && (
                    <button
                      onClick={onViewComments}
                      className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                    >
                      View all {comments.length} comments
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
            <button
              onClick={() => onBookmark(post.id)}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300"
            >
              Close
            </button>
            <button
              onClick={onManageMedia}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Manage Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// MEDIA MODAL
// =============================================

interface MediaModalProps {
  post: Post;
  media: MediaAttachment[];
  onClose: () => void;
  onAddMedia: (files: File[]) => void;
  onDeleteMedia: (mediaId: string) => void;
  isLoading?: boolean;
}

const MediaModal = ({
  post,
  media,
  onClose,
  onAddMedia,
  onDeleteMedia,
  isLoading,
}: MediaModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    await onAddMedia(selectedFiles);
    setSelectedFiles([]);
    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image"))
      return <Image className="w-8 h-8 text-blue-400" />;
    if (type.includes("video"))
      return <Video className="w-8 h-8 text-green-400" />;
    if (type.includes("audio"))
      return <Headphones className="w-8 h-8 text-purple-400" />;
    if (type.includes("pdf"))
      return <FilePdf className="w-8 h-8 text-red-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Media Manager - {post.title || "Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-8 p-6 border-2 border-dashed border-white/10 rounded-lg">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="w-12 h-12 text-gray-500 mb-3" />
              <p className="text-white font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Images, Videos, Audio, PDF (Max 100MB)
              </p>
            </label>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-white font-medium">
                  Selected Files ({selectedFiles.length})
                </h4>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-white text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedFiles(
                          selectedFiles.filter((_, i) => i !== index),
                        )
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleUpload}
                  disabled={uploading || isLoading}
                  className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {uploading || isLoading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} File(s)`}
                </button>
              </div>
            )}
          </div>

          {/* Media List */}
          <div>
            <h3 className="text-white font-medium mb-4">
              Attached Media ({media.length})
            </h3>
            {media.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No media attached yet
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    {item.category === "IMAGE" ? (
                      <img
                        src={item.url}
                        alt={item.caption || "Media"}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : item.category === "VIDEO" ? (
                      <video
                        src={item.url}
                        controls
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-700 rounded-lg flex items-center justify-center">
                        {getFileIcon(item.type)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => window.open(item.url, "_blank")}
                        className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => onDeleteMedia(item.id)}
                        className="p-2 bg-red-500 rounded-lg hover:bg-red-600"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                      <p className="text-white text-xs truncate">
                        {item.filename}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {formatFileSize(item.fileSize)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMMENTS MODAL
// =============================================

interface CommentsModalProps {
  post: Post;
  comments: any[];
  onClose: () => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  commentContent: string;
  setCommentContent: (content: string) => void;
  isLoading?: boolean;
}

const CommentsModal = ({
  post,
  comments,
  onClose,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  commentContent,
  setCommentContent,
  isLoading,
}: CommentsModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Comments - {post.title || "Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Comment Form */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-white font-medium mb-3">Add Comment</h4>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white mb-3"
              placeholder="Write your comment here..."
            />
            <button
              onClick={onAddComment}
              disabled={!commentContent.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post Comment"}
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">
              All Comments ({comments.length})
            </h4>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {comment.student?.name?.charAt(0) ||
                            comment.teacher?.name?.charAt(0) ||
                            "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {comment.student?.name ||
                            comment.teacher?.name ||
                            "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLikeComment(comment.id)}
                        className="p-1 hover:bg-white/5 rounded"
                      >
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {comment.likes} likes
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-500">(edited)</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// BULK ACTION MODAL
// =============================================

interface BulkActionModalProps {
  selectedCount: number;
  onClose: () => void;
  onAction: (
    action:
      | "publish"
      | "unpublish"
      | "feature"
      | "unfeature"
      | "pin"
      | "unpin"
      | "delete",
  ) => void;
  isLoading?: boolean;
}

const BulkActionModal = ({
  selectedCount,
  onClose,
  onAction,
  isLoading,
}: BulkActionModalProps) => {
  const [action, setAction] = useState<
    | "publish"
    | "unpublish"
    | "feature"
    | "unfeature"
    | "pin"
    | "unpin"
    | "delete"
  >("publish");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(action);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Bulk Action - {selectedCount}{" "}
            {selectedCount === 1 ? "Post" : "Posts"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="feature">Feature</option>
              <option value="unfeature">Unfeature</option>
              <option value="pin">Pin</option>
              <option value="unpin">Unpin</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {action === "delete" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ This action cannot be undone. {selectedCount} posts will be
                permanently deleted.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Execute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
