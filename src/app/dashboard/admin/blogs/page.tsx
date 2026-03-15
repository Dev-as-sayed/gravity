// src/app/dashboard/admin/blogs/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  BookOpen,
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
  FileText,
  X,
  Award,
  Users,
  Download,
  Upload,
  BarChart,
  TrendingUp,
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
  Image,
  Video,
  Link2,
  File,
  ImageIcon,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";

import {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useGetBlogStatsQuery,
  useGetBlogCommentsQuery,
  useGetCommentStatsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  usePublishBlogMutation,
  useUnpublishBlogMutation,
  useLikeBlogMutation,
  useShareBlogMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useApproveCommentMutation,
  useRejectCommentMutation,
  useBulkBlogActionMutation,
  useBulkCommentActionMutation,
} from "@/store/api/blogApi";
import { useGetTeachersQuery } from "@/store/api/teacherApi";

// Types
interface Blog {
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
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
  };
  _count?: {
    comments: number;
  };
}

interface BlogComment {
  id: string;
  blogId: string;
  name?: string | null;
  email?: string | null;
  content: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
}

interface Filters {
  search: string;
  category: string;
  tag: string;
  teacherId: string;
  isPublished: string;
}

const BlogManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [commentsModal, setCommentsModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    tag: "",
    teacherId: "",
    isPublished: "",
  });
  const [commentContent, setCommentContent] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: blogsData,
    isLoading,
    error,
    refetch,
  } = useGetBlogsQuery({
    page,
    limit,
    search: filters.search || undefined,
    category: filters.category || undefined,
    tag: filters.tag || undefined,
    teacherId: filters.teacherId || undefined,
    isPublished: filters.isPublished
      ? filters.isPublished === "true"
      : undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetBlogStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleBlog, refetch: refetchBlog } = useGetBlogByIdQuery(
    selectedBlog?.id || "",
    { skip: !selectedBlog?.id },
  );

  const { data: blogComments, refetch: refetchComments } =
    useGetBlogCommentsQuery(
      { blogId: selectedBlog?.id || "", page: 1, limit: 50 },
      { skip: !selectedBlog?.id },
    );

  const { data: commentStats } = useGetCommentStatsQuery(undefined, {
    skip: !selectedBlog,
  });

  const { data: teachersData } = useGetTeachersQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const blogs = blogsData?.data || [];
  const meta = blogsData?.meta;
  const teachers = teachersData?.data || [];

  /* ===============================
  MUTATIONS
  =============================== */

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [publishBlog, { isLoading: isPublishing }] = usePublishBlogMutation();
  const [unpublishBlog, { isLoading: isUnpublishing }] =
    useUnpublishBlogMutation();
  const [likeBlog] = useLikeBlogMutation();
  const [shareBlog] = useShareBlogMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] =
    useDeleteCommentMutation();
  const [approveComment, { isLoading: isApproving }] =
    useApproveCommentMutation();
  const [rejectComment, { isLoading: isRejecting }] =
    useRejectCommentMutation();
  const [bulkAction, { isLoading: isBulkAction }] = useBulkBlogActionMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singleBlog && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singleBlog, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (blog: Blog) => {
    const result = await Swal.fire({
      title: "Delete Blog?",
      text: `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`,
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
        await deleteBlog(blog.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Blog has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedBlog?.id === blog.id) {
          setSelectedBlog(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete blog",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishBlog(id).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Blog published successfully.",
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
        text: error.data?.message || "Failed to publish blog",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishBlog(id).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Blog unpublished successfully.",
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
        text: error.data?.message || "Failed to unpublish blog",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleLike = async (id: string) => {
    try {
      await likeBlog(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleShare = async (id: string, platform: string) => {
    try {
      await shareBlog(id).unwrap();
      Swal.fire({
        title: "Shared!",
        text: `Blog shared on ${platform}`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedBlog || !commentContent.trim()) return;

    try {
      await addComment({
        blogId: selectedBlog.id,
        data: {
          content: commentContent,
          name: commentName || undefined,
          email: commentEmail || undefined,
        },
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
      setCommentName("");
      setCommentEmail("");
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

  const handleApproveComment = async (commentId: string) => {
    if (!selectedBlog) return;

    try {
      await approveComment({
        blogId: selectedBlog.id,
        commentId,
      }).unwrap();
      refetchComments();
    } catch (error: any) {
      console.error("Failed to approve comment:", error);
    }
  };

  const handleRejectComment = async (commentId: string) => {
    if (!selectedBlog) return;

    try {
      await rejectComment({
        blogId: selectedBlog.id,
        commentId,
      }).unwrap();
      refetchComments();
    } catch (error: any) {
      console.error("Failed to reject comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedBlog) return;

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
          blogId: selectedBlog.id,
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
    action: "publish" | "unpublish" | "delete",
  ) => {
    if (!selectedBlogs.length) {
      Swal.fire({
        title: "No blogs selected",
        text: "Please select at least one blog",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}ed`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedBlogs.length} blogs?`,
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
          blogIds: selectedBlogs,
          action,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedBlogs.length} blogs ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedBlogs([]);
        setSelectAll(false);
        refetch();
        refetchStats();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} blogs`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleCreateBlog = async (data: any) => {
    try {
      await createBlog(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Blog created successfully",
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
        text: error.data?.message || "Failed to create blog",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdateBlog = async (id: string, data: any) => {
    try {
      await updateBlog({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Blog updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedBlog(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update blog",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSelect = (id: string) => {
    if (selectedBlogs.includes(id)) {
      setSelectedBlogs(selectedBlogs.filter((s) => s !== id));
    } else {
      setSelectedBlogs([...selectedBlogs, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(blogs.map((b: Blog) => b.id));
    }
    setSelectAll(!selectAll);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      tag: "",
      teacherId: "",
      isPublished: "",
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

  // Get status color
  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  };

  // Get comment status color
  const getCommentStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "SPAM":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" />
          Blog Management
        </h1>
        <p className="text-gray-400">
          Create and manage blog posts, moderate comments
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Blogs</h3>
              <BookOpen className="w-5 h-5 text-blue-400" />
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
              <h3 className="text-gray-400 text-sm">Comments</h3>
              <MessageCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.comments || 0}
            </p>
          </div>
        </div>
      )}

      {/* Popular Categories & Tags */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.data?.popularCategories?.map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2"
                >
                  {cat.category}
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.data?.popularTags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2"
                >
                  #{tag.tag}
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                    {tag.count}
                  </span>
                </span>
              ))}
            </div>
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
              Create Blog
            </button>
            <button
              onClick={() => setBulkActionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              disabled={selectedBlogs.length === 0}
            >
              <BookOpen className="w-4 h-4" />
              Bulk Actions ({selectedBlogs.length})
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
              placeholder="Search blogs..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => {
                    setFilters({ ...filters, category: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., Physics"
                />
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
                  placeholder="e.g., quantum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author
                </label>
                <select
                  value={filters.teacherId}
                  onChange={(e) => {
                    setFilters({ ...filters, teacherId: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Authors</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.isPublished}
                  onChange={(e) => {
                    setFilters({ ...filters, isPublished: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
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
      {selectedBlogs.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedBlogs.length}</span> blogs
            selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("publish")}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction("unpublish")}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
            >
              Unpublish
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

      {/* Blogs Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load blogs</p>
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
                        checked={selectAll && blogs.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Blog
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Author
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Categories
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Stats
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Published
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog: Blog) => (
                    <tr
                      key={blog.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(blog)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedBlogs.includes(blog.id)}
                          onChange={() => handleSelect(blog.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {blog.featuredImage ? (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden">
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {blog.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {blog.excerpt?.substring(0, 50) || "No excerpt"}
                              ...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {blog.teacher?.name?.charAt(0) || "A"}
                            </span>
                          </div>
                          <span className="text-white text-sm">
                            {blog.teacher?.name || "Admin"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {blog.categories.slice(0, 2).map((cat, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                          {blog.categories.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{blog.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.isPublished)}`}
                        >
                          {blog.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="w-3 h-3" />
                            {blog.views}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <ThumbsUp className="w-3 h-3" />
                            {blog.likes}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageCircle className="w-3 h-3" />
                            {blog._count?.comments || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {blog.isPublished
                              ? formatDate(blog.publishedAt)
                              : formatDate(blog.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!blog.isPublished ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublish(blog.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Publish"
                              disabled={isPublishing}
                            >
                              <Send className="w-4 h-4 text-green-400" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnpublish(blog.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Unpublish"
                              disabled={isUnpublishing}
                            >
                              <XCircle className="w-4 h-4 text-yellow-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlog(blog);
                              setCommentsModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Comments"
                          >
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlog(blog);
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
                              handleDelete(blog);
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
                  blogs
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
        <BlogModal
          mode="create"
          teachers={teachers}
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreateBlog}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedBlog && (
        <BlogModal
          mode="edit"
          blog={selectedBlog}
          teachers={teachers}
          onClose={() => {
            setEditModal(false);
            setSelectedBlog(null);
          }}
          onSubmit={(data) => handleUpdateBlog(selectedBlog.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedBlog && (
        <ViewBlogModal
          blog={singleBlog || selectedBlog}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedBlog(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onViewComments={() => {
            setViewModal(false);
            setCommentsModal(true);
          }}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onLike={handleLike}
          onShare={handleShare}
        />
      )}

      {commentsModal && selectedBlog && (
        <CommentsModal
          blog={selectedBlog}
          comments={blogComments?.data || []}
          stats={commentStats?.data}
          onClose={() => {
            setCommentsModal(false);
            setSelectedBlog(null);
          }}
          onAddComment={handleAddComment}
          onApproveComment={handleApproveComment}
          onRejectComment={handleRejectComment}
          onDeleteComment={handleDeleteComment}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          commentName={commentName}
          setCommentName={setCommentName}
          commentEmail={commentEmail}
          setCommentEmail={setCommentEmail}
          isLoading={isAddingComment}
        />
      )}

      {bulkActionModal && (
        <BulkActionModal
          selectedCount={selectedBlogs.length}
          onClose={() => setBulkActionModal(false)}
          onAction={handleBulkAction}
          isLoading={isBulkAction}
        />
      )}
    </div>
  );
};

export default BlogManagement;

// =============================================
// BLOG MODAL (Create/Edit)
// =============================================

interface BlogModalProps {
  mode: "create" | "edit";
  blog?: Blog | null;
  teachers: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const BlogModal = ({
  mode,
  blog,
  teachers,
  onClose,
  onSubmit,
  isLoading,
}: BlogModalProps) => {
  const [form, setForm] = useState({
    title: blog?.title || "",
    slug: blog?.slug || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    teacherId: blog?.teacherId || "",
    featuredImage: blog?.featuredImage || "",
    thumbnail: blog?.thumbnail || "",
    metaTitle: blog?.metaTitle || "",
    metaDescription: blog?.metaDescription || "",
    metaKeywords: blog?.metaKeywords?.join(", ") || "",
    categories: blog?.categories?.join(", ") || "",
    tags: blog?.tags?.join(", ") || "",
    isPublished: blog?.isPublished || false,
    allowComments: blog?.allowComments ?? true,
  });

  const [gallery, setGallery] = useState<string[]>(blog?.gallery || []);
  const [galleryInput, setGalleryInput] = useState("");

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

  const addToGallery = () => {
    if (galleryInput.trim()) {
      setGallery([...gallery, galleryInput.trim()]);
      setGalleryInput("");
    }
  };

  const removeFromGallery = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate slug from title if not provided
    const slug =
      form.slug ||
      form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    onSubmit({
      ...form,
      slug,
      gallery,
      metaKeywords: form.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      categories: form.categories
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Blog" : "Edit Blog"}
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
              placeholder="Enter blog title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="leave-empty-to-auto-generate"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version of the title (auto-generated if empty)
            </p>
          </div>

          {/* Author Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Author *
            </label>
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select Author</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}{" "}
                  {teacher.qualification ? `(${teacher.qualification})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              name="featuredImage"
              value={form.featuredImage}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gallery Images
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addToGallery}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {gallery.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromGallery(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              placeholder="Brief description of the blog post..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white font-mono"
              placeholder="Write your blog content here... (supports HTML/markdown)"
            />
          </div>

          {/* Categories and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories (comma separated)
              </label>
              <input
                type="text"
                name="categories"
                value={form.categories}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="Physics, Quantum Mechanics, Education"
              />
            </div>
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
                placeholder="quantum, physics, learning"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Publish immediately</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowComments"
                checked={form.allowComments}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Allow comments</span>
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
                placeholder="SEO title (defaults to blog title)"
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
                placeholder="SEO description (defaults to excerpt)"
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
                placeholder="physics, education, science"
              />
            </div>
          </div>

          {/* Current Author Info (for edit mode) */}
          {mode === "edit" && blog?.teacher && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                <span className="font-medium">Current Author:</span>{" "}
                {blog.teacher.name}
                {blog.teacher.qualification &&
                  ` (${blog.teacher.qualification})`}
              </p>
            </div>
          )}

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
                  ? "Create Blog"
                  : "Update Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW BLOG MODAL
// =============================================

interface ViewBlogModalProps {
  blog: Blog;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onViewComments: () => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string, platform: string) => void;
}

const ViewBlogModal = ({
  blog,
  isLoading,
  onClose,
  onEdit,
  onViewComments,
  onPublish,
  onUnpublish,
  onLike,
  onShare,
}: ViewBlogModalProps) => {
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "gallery">(
    "content",
  );
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-500/20 text-green-400"
      : "bg-yellow-500/20 text-yellow-400";
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

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white text-lg">Loading blog details...</p>
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
            <BookOpen className="w-5 h-5 text-blue-400" />
            Blog Details
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
            {blog.featuredImage ? (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{blog.title}</h3>
              <p className="text-gray-400">{blog.excerpt || "No excerpt"}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.isPublished)}`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  {blog.readTime || calculateReadTime(blog.content)} min read
                </span>
                {blog.allowComments && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Comments Enabled
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!blog.isPublished ? (
                <button
                  onClick={() => onPublish(blog.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => onUnpublish(blog.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Unpublish
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
                {blog.teacher?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">
                {blog.teacher?.name || "Admin"}
                {blog.teacher?.qualification &&
                  ` (${blog.teacher.qualification})`}
              </p>
              <p className="text-sm text-gray-400">
                Created: {formatDate(blog.createdAt)}
                {blog.publishedAt &&
                  ` • Published: ${formatDate(blog.publishedAt)}`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{blog.views}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <ThumbsUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{blog.likes}</p>
              <p className="text-xs text-gray-400">Likes</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-center">
              <Share2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{blog.shares}</p>
              <p className="text-xs text-gray-400">Shares</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
              <MessageCircle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">
                {blog._count?.comments || 0}
              </p>
              <p className="text-xs text-gray-400">Comments</p>
            </div>
          </div>

          {/* Engagement Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => onLike(blog.id)}
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Like ({blog.likes})
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share ({blog.shares})
              </button>
              {showShareMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onShare(blog.id, "facebook");
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <Facebook className="w-4 h-4 text-blue-400" />
                      Facebook
                    </button>
                    <button
                      onClick={() => {
                        onShare(blog.id, "twitter");
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4 text-blue-400" />
                      Twitter
                    </button>
                    <button
                      onClick={() => {
                        onShare(blog.id, "linkedin");
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <Linkedin className="w-4 h-4 text-blue-400" />
                      LinkedIn
                    </button>
                  </div>
                </div>
              )}
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
              onClick={() => setActiveTab("gallery")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "gallery"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Gallery ({blog.gallery.length})
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "seo"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              SEO
            </button>
          </div>

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <h4 className="text-white font-medium mb-2">Content</h4>
                <div className="text-gray-300 whitespace-pre-wrap bg-gray-800/30 p-4 rounded-lg">
                  {blog.content}
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="grid grid-cols-2 gap-4">
                {blog.categories.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {blog.categories.map((cat, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {blog.tags.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div>
              <h4 className="text-white font-medium mb-4">Gallery Images</h4>
              {blog.gallery.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No gallery images
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {blog.gallery.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Eye className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Meta Title</h4>
                <p className="text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                  {blog.metaTitle || blog.title}
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">
                  Meta Description
                </h4>
                <p className="text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                  {blog.metaDescription ||
                    blog.excerpt ||
                    "No meta description"}
                </p>
              </div>
              {blog.metaKeywords.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Meta Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {blog.metaKeywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
            <button
              onClick={onViewComments}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              View Comments ({blog._count?.comments || 0})
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300"
            >
              Close
            </button>
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
  blog: Blog;
  comments: BlogComment[];
  stats?: any;
  onClose: () => void;
  onAddComment: () => void;
  onApproveComment: (commentId: string) => void;
  onRejectComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  commentContent: string;
  setCommentContent: (content: string) => void;
  commentName: string;
  setCommentName: (name: string) => void;
  commentEmail: string;
  setCommentEmail: (email: string) => void;
  isLoading?: boolean;
}

const CommentsModal = ({
  blog,
  comments,
  stats,
  onClose,
  onAddComment,
  onApproveComment,
  onRejectComment,
  onDeleteComment,
  commentContent,
  setCommentContent,
  commentName,
  setCommentName,
  commentEmail,
  setCommentEmail,
  isLoading,
}: CommentsModalProps) => {
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "spam">(
    "all",
  );

  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true;
    if (filter === "approved") return comment.status === "APPROVED";
    if (filter === "pending") return comment.status === "PENDING";
    if (filter === "spam") return comment.status === "SPAM";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "SPAM":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

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
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Comments - {blog.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">
                  {stats.total || 0}
                </p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">
                  {stats.approved || 0}
                </p>
                <p className="text-xs text-gray-400">Approved</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.pending || 0}
                </p>
                <p className="text-xs text-gray-400">Pending</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-400">
                  {stats.spam || 0}
                </p>
                <p className="text-xs text-gray-400">Spam</p>
              </div>
            </div>
          )}

          {/* Add Comment Form */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-white font-medium mb-3">Add Test Comment</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Name (optional)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
            </div>
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

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("spam")}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === "spam"
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Spam
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No comments found
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {comment.name?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {comment.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {comment.email || "No email"} •{" "}
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {comment.status !== "APPROVED" && (
                        <button
                          onClick={() => onApproveComment(comment.id)}
                          className="p-1 hover:bg-green-500/10 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      {comment.status !== "REJECTED" &&
                        comment.status !== "SPAM" && (
                          <button
                            onClick={() => onRejectComment(comment.id)}
                            className="p-1 hover:bg-red-500/10 rounded"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                          </button>
                        )}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(comment.status)}`}
                    >
                      {comment.status}
                    </span>
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
  onAction: (action: "publish" | "unpublish" | "delete") => void;
  isLoading?: boolean;
}

const BulkActionModal = ({
  selectedCount,
  onClose,
  onAction,
  isLoading,
}: BulkActionModalProps) => {
  const [action, setAction] = useState<"publish" | "unpublish" | "delete">(
    "publish",
  );

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
            {selectedCount === 1 ? "Blog" : "Blogs"}
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
              <option value="delete">Delete</option>
            </select>
          </div>

          {action === "delete" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ This action cannot be undone. {selectedCount} blog
                {selectedCount !== 1 ? "s" : ""} will be permanently deleted
                along with all comments.
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
