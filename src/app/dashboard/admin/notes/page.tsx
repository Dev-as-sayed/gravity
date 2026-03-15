// src/app/dashboard/admin/notes/page.tsx
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
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  Award,
  Download,
  BarChart,
  ThumbsUp,
  Bookmark,
  Globe,
  Lock,
  File,
  Headphones,
  Video,
  Image,
  Crown,
  Users as UsersIcon,
} from "lucide-react";

import {
  useGetNotesQuery,
  useGetNoteByIdQuery,
  useGetNoteStatsQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useToggleNotePublicMutation,
  useToggleNotePremiumMutation,
  useDownloadNoteMutation,
  useSaveNoteMutation,
  useLikeNoteMutation,
  useBulkNoteActionMutation,
} from "@/store/api/noteApi";
import { useGetTeachersQuery } from "@/store/api/teacherApi";
import { useGetBatchesQuery } from "@/store/api/batchApi";

// Types
interface Note {
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
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
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

interface Filters {
  search: string;
  subject: string;
  difficulty: string;
  teacherId: string;
  batchId: string;
  isPublic: string;
  isPremium: string;
}

const NotesManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    subject: "",
    difficulty: "",
    teacherId: "",
    batchId: "",
    isPublic: "",
    isPremium: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: notesData,
    isLoading,
    error,
    refetch,
  } = useGetNotesQuery({
    page,
    limit,
    search: filters.search || undefined,
    subject: filters.subject || undefined,
    difficulty: filters.difficulty || undefined,
    teacherId: filters.teacherId || undefined,
    batchId: filters.batchId || undefined,
    isPublic: filters.isPublic ? filters.isPublic === "true" : undefined,
    isPremium: filters.isPremium ? filters.isPremium === "true" : undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetNoteStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleNote, refetch: refetchNote } = useGetNoteByIdQuery(
    selectedNote?.id || "",
    { skip: !selectedNote?.id },
  );

  const { data: teachersData } = useGetTeachersQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const { data: batchesData } = useGetBatchesQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const notes = notesData?.data || [];
  const meta = notesData?.meta;
  const teachers = teachersData?.data || [];
  const batches = batchesData?.data || [];

  /* ===============================
  MUTATIONS
  =============================== */

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [togglePublic, { isLoading: isTogglingPublic }] =
    useToggleNotePublicMutation();
  const [togglePremium, { isLoading: isTogglingPremium }] =
    useToggleNotePremiumMutation();
  const [downloadNote] = useDownloadNoteMutation();
  const [saveNote] = useSaveNoteMutation();
  const [likeNote] = useLikeNoteMutation();
  const [bulkAction, { isLoading: isBulkAction }] = useBulkNoteActionMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singleNote && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singleNote, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (note: Note) => {
    setSelectedNote(note);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (note: Note) => {
    const result = await Swal.fire({
      title: "Delete Note?",
      text: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
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
        await deleteNote(note.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Note has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedNote?.id === note.id) {
          setSelectedNote(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete note",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleTogglePublic = async (id: string) => {
    try {
      await togglePublic(id).unwrap();
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update visibility",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleTogglePremium = async (id: string) => {
    try {
      await togglePremium(id).unwrap();
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update premium status",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const result = await downloadNote(id).unwrap();
      window.open(result.fileUrl, "_blank");
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to download",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSave = async (id: string) => {
    try {
      await saveNote(id).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Failed to save:", error);
    }
  };

  const handleBulkAction = async (
    action: "publish" | "unpublish" | "premium" | "unpremium" | "delete",
  ) => {
    if (!selectedNotes.length) {
      Swal.fire({
        title: "No notes selected",
        text: "Please select at least one note",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}ed`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedNotes.length} notes?`,
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
          noteIds: selectedNotes,
          action,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedNotes.length} notes ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedNotes([]);
        setSelectAll(false);
        refetch();
        refetchStats();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} notes`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleCreateNote = async (data: any) => {
    try {
      await createNote(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Note created successfully",
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
        text: error.data?.message || "Failed to create note",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdateNote = async (id: string, data: any) => {
    try {
      await updateNote({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Note updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedNote(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update note",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSelect = (id: string) => {
    if (selectedNotes.includes(id)) {
      setSelectedNotes(selectedNotes.filter((s) => s !== id));
    } else {
      setSelectedNotes([...selectedNotes, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map((n: Note) => n.id));
    }
    setSelectAll(!selectAll);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      difficulty: "",
      teacherId: "",
      batchId: "",
      isPublic: "",
      isPremium: "",
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

  // Format file size
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get file icon
  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return <File className="w-4 h-4" />;
    if (fileType.includes("pdf"))
      return <File className="w-4 h-4 text-red-400" />;
    if (fileType.includes("video"))
      return <Video className="w-4 h-4 text-blue-400" />;
    if (fileType.includes("audio"))
      return <Headphones className="w-4 h-4 text-green-400" />;
    if (fileType.includes("image"))
      return <Image className="w-4 h-4 text-purple-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-500/20 text-green-400";
      case "INTERMEDIATE":
        return "bg-yellow-500/20 text-yellow-400";
      case "ADVANCED":
        return "bg-orange-500/20 text-orange-400";
      case "EXPERT":
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
          <FileText className="w-8 h-8 text-blue-400" />
          Notes Management
        </h1>
        <p className="text-gray-400">
          Create and manage study notes, PDFs, and learning materials
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Notes</h3>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Public Notes</h3>
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.public || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Premium Notes</h3>
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.premium || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Downloads</h3>
              <Download className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.downloads?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Difficulty Distribution */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-400" />
              Difficulty Distribution
            </h3>
            <div className="space-y-3">
              {stats.data?.difficultyDistribution?.map((item) => (
                <div key={item.difficulty} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-24">
                    {item.difficulty}
                  </span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.difficulty === "BEGINNER"
                          ? "bg-green-400"
                          : item.difficulty === "INTERMEDIATE"
                            ? "bg-yellow-400"
                            : item.difficulty === "ADVANCED"
                              ? "bg-orange-400"
                              : "bg-red-400"
                      }`}
                      style={{
                        width: `${(item._count / stats.data.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-12">{item._count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Popular Subjects
            </h3>
            <div className="space-y-3">
              {stats.data?.popularSubjects?.map((item) => (
                <div
                  key={item.subject}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-400">{item.subject}</span>
                  <span className="text-sm text-white">
                    {item._count} notes
                  </span>
                </div>
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
              Create Note
            </button>
            <button
              onClick={() => setBulkActionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              disabled={selectedNotes.length === 0}
            >
              <FileText className="w-4 h-4" />
              Bulk Actions ({selectedNotes.length})
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
              placeholder="Search notes..."
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
                  Subject
                </label>
                <input
                  type="text"
                  value={filters.subject}
                  onChange={(e) => {
                    setFilters({ ...filters, subject: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., Physics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => {
                    setFilters({ ...filters, difficulty: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
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
                  <option value="">All Batches</option>
                  {batches.map((batch: any) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibility
                </label>
                <select
                  value={filters.isPublic}
                  onChange={(e) => {
                    setFilters({ ...filters, isPublic: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Premium
                </label>
                <select
                  value={filters.isPremium}
                  onChange={(e) => {
                    setFilters({ ...filters, isPremium: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Premium</option>
                  <option value="false">Free</option>
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
      {selectedNotes.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedNotes.length}</span> notes
            selected
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleBulkAction("publish")}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              Make Public
            </button>
            <button
              onClick={() => handleBulkAction("unpublish")}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
            >
              Make Private
            </button>
            <button
              onClick={() => handleBulkAction("premium")}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
            >
              Make Premium
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

      {/* Notes Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load notes</p>
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
                        checked={selectAll && notes.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Note
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Author
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Subject
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Difficulty
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Access
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Stats
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      File
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note: Note) => (
                    <tr
                      key={note.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(note)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedNotes.includes(note.id)}
                          onChange={() => handleSelect(note.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {note.fileUrl && note.fileType?.includes("pdf") ? (
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                              <File className="w-5 h-5 text-red-400" />
                            </div>
                          ) : note.fileType?.includes("video") ? (
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Video className="w-5 h-5 text-blue-400" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {note.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {note.description?.substring(0, 50) ||
                                "No description"}
                              ...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {note.teacher?.name?.charAt(0) || "A"}
                            </span>
                          </div>
                          <span className="text-white text-sm">
                            {note.teacher?.name || "Admin"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white text-sm">
                          {note.subject || "General"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(note.difficulty)}`}
                        >
                          {note.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              note.isPublic
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {note.isPublic ? (
                              <Globe className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                            {note.isPublic ? "Public" : "Private"}
                          </span>
                          {note.isPremium && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              <Crown className="w-3 h-3" />
                              Premium {note.price ? `₹${note.price}` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="w-3 h-3" />
                            {note.views}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Download className="w-3 h-3" />
                            {note.downloads}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <ThumbsUp className="w-3 h-3" />
                            {note.likes}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getFileIcon(note.fileType)}
                          {note.fileSize && (
                            <span className="text-xs text-gray-500">
                              {formatFileSize(note.fileSize)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {note.fileUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(note.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(note.id);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Bookmark className="w-4 h-4 text-yellow-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePublic(note.id);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title={
                              note.isPublic ? "Make Private" : "Make Public"
                            }
                            disabled={isTogglingPublic}
                          >
                            {note.isPublic ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Globe className="w-4 h-4 text-blue-400" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNote(note);
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
                              handleDelete(note);
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
                  notes
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
        <NoteModal
          mode="create"
          teachers={teachers}
          batches={batches}
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreateNote}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedNote && (
        <NoteModal
          mode="edit"
          note={selectedNote}
          teachers={teachers}
          batches={batches}
          onClose={() => {
            setEditModal(false);
            setSelectedNote(null);
          }}
          onSubmit={(data) => handleUpdateNote(selectedNote.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedNote && (
        <ViewNoteModal
          note={singleNote || selectedNote}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedNote(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onDownload={handleDownload}
          onSave={handleSave}
          onTogglePublic={handleTogglePublic}
          onTogglePremium={handleTogglePremium}
        />
      )}

      {bulkActionModal && (
        <BulkActionModal
          selectedCount={selectedNotes.length}
          onClose={() => setBulkActionModal(false)}
          onAction={handleBulkAction}
          isLoading={isBulkAction}
        />
      )}
    </div>
  );
};

export default NotesManagement;

// =============================================
// NOTE MODAL (Create/Edit)
// =============================================

interface NoteModalProps {
  mode: "create" | "edit";
  note?: Note | null;
  teachers: any[];
  batches: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const NoteModal = ({
  mode,
  note,
  teachers,
  batches,
  onClose,
  onSubmit,
  isLoading,
}: NoteModalProps) => {
  const [form, setForm] = useState({
    title: note?.title || "",
    slug: note?.slug || "",
    description: note?.description || "",
    content: note?.content || "",
    fileUrl: note?.fileUrl || "",
    fileType: note?.fileType || "",
    fileSize: note?.fileSize || "",
    duration: note?.duration || "",
    pages: note?.pages || "",
    teacherId: note?.teacherId || "",
    batchId: note?.batchId || "",
    subject: note?.subject || "",
    topic: note?.topic || "",
    topics: note?.topics?.join(", ") || "",
    isPublic: note?.isPublic || false,
    isPremium: note?.isPremium || false,
    price: note?.price || "",
    freePreview: note?.freePreview || false,
    tags: note?.tags?.join(", ") || "",
    difficulty: note?.difficulty || "INTERMEDIATE",
    metaTitle: note?.metaTitle || "",
    metaDescription: note?.metaDescription || "",
    metaKeywords: note?.metaKeywords?.join(", ") || "",
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

    // Generate slug from title if not provided
    const slug =
      form.slug ||
      form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();

    onSubmit({
      ...form,
      slug,
      fileSize: form.fileSize ? parseInt(form.fileSize) : null,
      duration: form.duration ? parseInt(form.duration) : null,
      pages: form.pages ? parseInt(form.pages) : null,
      price: form.price ? parseFloat(form.price) : null,
      topics: form.topics
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      metaKeywords: form.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Note" : "Edit Note"}
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
              placeholder="Enter note title"
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
          </div>

          {/* Author and Batch */}
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Batch (Optional)
              </label>
              <select
                name="batchId"
                value={form.batchId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="">No Batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject and Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="e.g., Physics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="e.g., Quantum Mechanics"
              />
            </div>
          </div>

          {/* Topics (multiple) */}
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
              placeholder="quantum, waves, mechanics"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Brief description of the note..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content (Optional)
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white font-mono"
              placeholder="Write note content here... (supports HTML/markdown)"
            />
          </div>

          {/* File Details */}
          <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-white font-medium">File Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File URL
              </label>
              <input
                type="url"
                name="fileUrl"
                value={form.fileUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="https://example.com/file.pdf"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Type
                </label>
                <select
                  name="fileType"
                  value={form.fileType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select Type</option>
                  <option value="pdf">PDF</option>
                  <option value="video/mp4">Video MP4</option>
                  <option value="video/webm">Video WebM</option>
                  <option value="audio/mp3">Audio MP3</option>
                  <option value="image/jpeg">Image JPEG</option>
                  <option value="image/png">Image PNG</option>
                  <option value="application/ppt">PPT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Size (bytes)
                </label>
                <input
                  type="number"
                  name="fileSize"
                  value={form.fileSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="1048576"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pages
                </label>
                <input
                  type="number"
                  name="pages"
                  value={form.pages}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Access Settings */}
          <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-white font-medium">Access Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">
                  Public (visible to all)
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={form.isPremium}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Premium (paid)</span>
              </label>
            </div>

            {form.isPremium && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                    placeholder="499"
                  />
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    name="freePreview"
                    checked={form.freePreview}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">
                    Enable free preview
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Tags and Difficulty */}
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
                placeholder="physics, quantum, formula"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
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
                placeholder="physics, education, notes"
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
                  ? "Create Note"
                  : "Update Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW NOTE MODAL
// =============================================

interface ViewNoteModalProps {
  note: Note;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDownload: (id: string) => void;
  onSave: (id: string) => void;
  onTogglePublic: (id: string) => void;
  onTogglePremium: (id: string) => void;
}

const ViewNoteModal = ({
  note,
  isLoading,
  onClose,
  onEdit,
  onDownload,
  onSave,
  onTogglePublic,
  onTogglePremium,
}: ViewNoteModalProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "content" | "seo">(
    "details",
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return <File className="w-8 h-8 text-gray-400" />;
    if (fileType.includes("pdf"))
      return <File className="w-8 h-8 text-red-400" />;
    if (fileType.includes("video"))
      return <Video className="w-8 h-8 text-blue-400" />;
    if (fileType.includes("audio"))
      return <Headphones className="w-8 h-8 text-green-400" />;
    if (fileType.includes("image"))
      return <Image className="w-8 h-8 text-purple-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white text-lg">Loading note details...</p>
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
            Note Details
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
            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              {getFileIcon(note.fileType)}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{note.title}</h3>
              <p className="text-gray-400">
                {note.description || "No description"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  {note.subject || "General"}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  {note.difficulty}
                </span>
                {note.isPublic ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                )}
                {note.isPremium && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium {note.price ? `₹${note.price}` : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {note.fileUrl && (
                <button
                  onClick={() => onDownload(note.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
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
                {note.teacher?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">
                {note.teacher?.name || "Admin"}
                {note.teacher?.qualification &&
                  ` (${note.teacher.qualification})`}
              </p>
              <p className="text-sm text-gray-400">
                Created: {formatDate(note.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{note.views}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <Download className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{note.downloads}</p>
              <p className="text-xs text-gray-400">Downloads</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-center">
              <ThumbsUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{note.likes}</p>
              <p className="text-xs text-gray-400">Likes</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
              <Bookmark className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{note.saves}</p>
              <p className="text-xs text-gray-400">Saves</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => onSave(note.id)}
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              {note.saves > 0 ? `Saved (${note.saves})` : "Save"}
            </button>
            <button
              onClick={() => onTogglePublic(note.id)}
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              {note.isPublic ? (
                <>
                  <Lock className="w-4 h-4" />
                  Make Private
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Make Public
                </>
              )}
            </button>
            <button
              onClick={() => onTogglePremium(note.id)}
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {note.isPremium ? "Remove Premium" : "Make Premium"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "details"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Details
            </button>
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

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">File Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      File Type:{" "}
                      <span className="text-white">
                        {note.fileType || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      File Size:{" "}
                      <span className="text-white">
                        {formatFileSize(note.fileSize)}
                      </span>
                    </p>
                    {note.duration && (
                      <p className="text-sm text-gray-400">
                        Duration:{" "}
                        <span className="text-white">
                          {Math.floor(note.duration / 60)} min{" "}
                          {note.duration % 60} sec
                        </span>
                      </p>
                    )}
                    {note.pages && (
                      <p className="text-sm text-gray-400">
                        Pages: <span className="text-white">{note.pages}</span>
                      </p>
                    )}
                    {note.fileUrl && (
                      <p className="text-sm text-gray-400">
                        URL:{" "}
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          View File
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Topics & Tags</h4>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {note.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {note.batch && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">
                    Associated Batch
                  </h4>
                  <p className="text-white">{note.batch.name}</p>
                  <p className="text-sm text-gray-400">{note.batch.subject}</p>
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="prose prose-invert max-w-none">
              <h4 className="text-white font-medium mb-2">Content</h4>
              <div className="text-gray-300 whitespace-pre-wrap bg-gray-800/30 p-4 rounded-lg">
                {note.content || "No content available"}
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Meta Title</h4>
                <p className="text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                  {note.metaTitle || note.title}
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">
                  Meta Description
                </h4>
                <p className="text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                  {note.metaDescription ||
                    note.description ||
                    "No meta description"}
                </p>
              </div>
              {note.metaKeywords.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Meta Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {note.metaKeywords.map((keyword, i) => (
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
// BULK ACTION MODAL
// =============================================

interface BulkActionModalProps {
  selectedCount: number;
  onClose: () => void;
  onAction: (
    action: "publish" | "unpublish" | "premium" | "unpremium" | "delete",
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
    "publish" | "unpublish" | "premium" | "unpremium" | "delete"
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
            {selectedCount === 1 ? "Note" : "Notes"}
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
              <option value="publish">Make Public</option>
              <option value="unpublish">Make Private</option>
              <option value="premium">Make Premium</option>
              <option value="unpremium">Make Free</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {action === "delete" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ This action cannot be undone. {selectedCount} note
                {selectedCount !== 1 ? "s" : ""} will be permanently deleted.
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
