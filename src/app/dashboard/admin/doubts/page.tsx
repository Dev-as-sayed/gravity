// src/app/dashboard/admin/doubts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  HelpCircle,
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
  MessageCircle,
  X,
  Award,
  Users,
  Download,
  Upload,
  BarChart,
  TrendingUp,
  BookOpen,
  GraduationCap,
  FileText,
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
  MessageSquare,
  UserPlus,
  CheckSquare,
  Flag,
  Hash,
  Tag,
  Calendar,
} from "lucide-react";

import {
  useGetDoubtsQuery,
  useGetDoubtByIdQuery,
  useGetDoubtStatsQuery,
  useGetDoubtAnswersQuery,
  useCreateDoubtMutation,
  useUpdateDoubtMutation,
  useDeleteDoubtMutation,
  useAssignTeacherMutation,
  useResolveDoubtMutation,
  useAddAnswerMutation,
  useUpdateAnswerMutation,
  useDeleteAnswerMutation,
  useAcceptAnswerMutation,
  useUpvoteAnswerMutation,
  useUpvoteDoubtMutation,
} from "@/store/api/doubtApi";
import { useGetTeachersQuery } from "@/store/api/teacherApi";

// Types
interface Doubt {
  id: string;
  title: string;
  description?: string | null;
  studentId: string;
  batchId?: string | null;
  subject?: string | null;
  topic?: string | null;
  status: "OPEN" | "ANSWERED" | "RESOLVED" | "CLOSED" | "ESCALATED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  assignedTo?: string | null;
  assignedAt?: string | null;
  resolvedAt?: string | null;
  viewCount: number;
  upvoteCount: number;
  tags: string[];
  createdAt: string;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
  };
  _count?: {
    answers: number;
  };
}

interface DoubtAnswer {
  id: string;
  doubtId: string;
  teacherId?: string | null;
  studentId?: string | null;
  content: string;
  images: string[];
  isAccepted: boolean;
  isOfficial: boolean;
  upvotes: number;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    profileImage?: string | null;
    qualification?: string | null;
  };
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

interface Filters {
  search: string;
  status: string;
  priority: string;
  subject: string;
  assignedTo: string;
}

const DoubtsManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [answersModal, setAnswersModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [selectedDoubtForAction, setSelectedDoubtForAction] =
    useState<Doubt | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    priority: "",
    subject: "",
    assignedTo: "",
  });
  const [answerContent, setAnswerContent] = useState("");
  const [resolutionRating, setResolutionRating] = useState(5);
  const [resolutionFeedback, setResolutionFeedback] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: doubtsData,
    isLoading,
    error,
    refetch,
  } = useGetDoubtsQuery({
    page,
    limit,
    search: filters.search || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    subject: filters.subject || undefined,
    assignedTo: filters.assignedTo || undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetDoubtStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleDoubt, refetch: refetchDoubt } = useGetDoubtByIdQuery(
    selectedDoubt?.id || "",
    { skip: !selectedDoubt?.id },
  );

  const { data: doubtAnswers, refetch: refetchAnswers } =
    useGetDoubtAnswersQuery(selectedDoubt?.id || "", {
      skip: !selectedDoubt?.id,
    });

  const { data: teachersData } = useGetTeachersQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const doubts = doubtsData?.data || [];
  const meta = doubtsData?.meta;
  const teachers = teachersData?.data || [];

  /* ===============================
  MUTATIONS
  =============================== */

  const [createDoubt, { isLoading: isCreating }] = useCreateDoubtMutation();
  const [updateDoubt, { isLoading: isUpdating }] = useUpdateDoubtMutation();
  const [deleteDoubt, { isLoading: isDeleting }] = useDeleteDoubtMutation();
  const [assignTeacher, { isLoading: isAssigning }] =
    useAssignTeacherMutation();
  const [resolveDoubt, { isLoading: isResolving }] = useResolveDoubtMutation();
  const [addAnswer, { isLoading: isAddingAnswer }] = useAddAnswerMutation();
  const [deleteAnswer, { isLoading: isDeletingAnswer }] =
    useDeleteAnswerMutation();
  const [acceptAnswer, { isLoading: isAccepting }] = useAcceptAnswerMutation();
  const [upvoteAnswer] = useUpvoteAnswerMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singleDoubt && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singleDoubt, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (doubt: Doubt) => {
    const result = await Swal.fire({
      title: "Delete Doubt?",
      text: `Are you sure you want to delete "${doubt.title}"? This action cannot be undone.`,
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
        await deleteDoubt(doubt.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Doubt has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedDoubt?.id === doubt.id) {
          setSelectedDoubt(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete doubt",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedDoubtForAction || !selectedTeacherId) return;

    try {
      await assignTeacher({
        id: selectedDoubtForAction.id,
        data: { teacherId: selectedTeacherId },
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Teacher assigned successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setAssignModal(false);
      setSelectedDoubtForAction(null);
      setSelectedTeacherId("");
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to assign teacher",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleResolveDoubt = async () => {
    if (!selectedDoubtForAction) return;

    try {
      await resolveDoubt({
        id: selectedDoubtForAction.id,
        data: { rating: resolutionRating, feedback: resolutionFeedback },
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Doubt marked as resolved.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setResolveModal(false);
      setSelectedDoubtForAction(null);
      setResolutionRating(5);
      setResolutionFeedback("");
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to resolve doubt",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleAddAnswer = async () => {
    if (!selectedDoubt || !answerContent.trim()) return;

    try {
      await addAnswer({
        doubtId: selectedDoubt.id,
        data: { content: answerContent },
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Answer added successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setAnswerContent("");
      refetchAnswers();
      refetchDoubt();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to add answer",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!selectedDoubt) return;

    try {
      await acceptAnswer({
        doubtId: selectedDoubt.id,
        answerId,
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Answer accepted as solution.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetchAnswers();
      refetchDoubt();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to accept answer",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    if (!selectedDoubt) return;

    try {
      await upvoteAnswer({
        doubtId: selectedDoubt.id,
        answerId,
      }).unwrap();
      refetchAnswers();
    } catch (error: any) {
      console.error("Failed to upvote:", error);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!selectedDoubt) return;

    const result = await Swal.fire({
      title: "Delete Answer?",
      text: "Are you sure you want to delete this answer?",
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
        await deleteAnswer({
          doubtId: selectedDoubt.id,
          answerId,
        }).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Answer deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchAnswers();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete answer",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleCreateDoubt = async (data: any) => {
    try {
      await createDoubt(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Doubt created successfully",
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
        text: error.data?.message || "Failed to create doubt",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdateDoubt = async (id: string, data: any) => {
    try {
      await updateDoubt({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Doubt updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedDoubt(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update doubt",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      subject: "",
      assignedTo: "",
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ANSWERED":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "RESOLVED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "CLOSED":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      case "ESCALATED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/20 text-red-400";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400";
      case "LOW":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-blue-400" />
          Doubt Management
        </h1>
        <p className="text-gray-400">
          Manage student doubts and provide solutions
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Doubts</h3>
              <HelpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Open</h3>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.open || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Resolved</h3>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.resolved || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Resolution Rate</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.resolutionRate || 0}%
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
              Create Doubt
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
              placeholder="Search doubts..."
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
                  <option value="OPEN">Open</option>
                  <option value="ANSWERED">Answered</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => {
                    setFilters({ ...filters, priority: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

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
                  Assigned To
                </label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => {
                    setFilters({ ...filters, assignedTo: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="unassigned">Unassigned</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
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

      {/* Doubts Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load doubts</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Doubt
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Student
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Subject
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Priority
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Assigned To
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Answers
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
                  {doubts.map((doubt: Doubt) => (
                    <tr
                      key={doubt.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(doubt)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {doubt.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doubt.topic || "General"} • {doubt.viewCount}{" "}
                              views
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {doubt.student?.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <span className="text-white text-sm">
                            {doubt.student?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white text-sm">
                          {doubt.subject || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doubt.status)}`}
                        >
                          {doubt.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {doubt.priority && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(doubt.priority)}`}
                          >
                            {doubt.priority}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {doubt.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {doubt.teacher?.name?.charAt(0) || "T"}
                              </span>
                            </div>
                            <span className="text-white text-sm">
                              {doubt.teacher?.name || "Unknown"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-white text-sm">
                            {doubt._count?.answers || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {formatDate(doubt.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doubt.status === "OPEN" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoubtForAction(doubt);
                                setAssignModal(true);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Assign Teacher"
                            >
                              <UserPlus className="w-4 h-4 text-purple-400" />
                            </button>
                          )}
                          {doubt.status === "ANSWERED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoubtForAction(doubt);
                                setResolveModal(true);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Resolve Doubt"
                            >
                              <CheckSquare className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoubt(doubt);
                              setAnswersModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Answers"
                          >
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoubt(doubt);
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
                              handleDelete(doubt);
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
                  doubts
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
        <DoubtModal
          mode="create"
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreateDoubt}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedDoubt && (
        <DoubtModal
          mode="edit"
          doubt={selectedDoubt}
          onClose={() => {
            setEditModal(false);
            setSelectedDoubt(null);
          }}
          onSubmit={(data) => handleUpdateDoubt(selectedDoubt.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedDoubt && (
        <ViewDoubtModal
          doubt={singleDoubt || selectedDoubt}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedDoubt(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onViewAnswers={() => {
            setViewModal(false);
            setAnswersModal(true);
          }}
          onAssignTeacher={() => {
            setViewModal(false);
            setSelectedDoubtForAction(selectedDoubt);
            setAssignModal(true);
          }}
          onResolve={() => {
            setViewModal(false);
            setSelectedDoubtForAction(selectedDoubt);
            setResolveModal(true);
          }}
        />
      )}

      {answersModal && selectedDoubt && (
        <AnswersModal
          doubt={selectedDoubt}
          answers={doubtAnswers || []}
          onClose={() => {
            setAnswersModal(false);
            setSelectedDoubt(null);
          }}
          onAddAnswer={handleAddAnswer}
          onAcceptAnswer={handleAcceptAnswer}
          onUpvoteAnswer={handleUpvoteAnswer}
          onDeleteAnswer={handleDeleteAnswer}
          answerContent={answerContent}
          setAnswerContent={setAnswerContent}
          isAddingAnswer={isAddingAnswer}
        />
      )}

      {assignModal && selectedDoubtForAction && (
        <AssignModal
          doubt={selectedDoubtForAction}
          teachers={teachers}
          onClose={() => {
            setAssignModal(false);
            setSelectedDoubtForAction(null);
            setSelectedTeacherId("");
          }}
          onAssign={handleAssignTeacher}
          selectedTeacherId={selectedTeacherId}
          setSelectedTeacherId={setSelectedTeacherId}
          isLoading={isAssigning}
        />
      )}

      {resolveModal && selectedDoubtForAction && (
        <ResolveModal
          doubt={selectedDoubtForAction}
          onClose={() => {
            setResolveModal(false);
            setSelectedDoubtForAction(null);
            setResolutionRating(5);
            setResolutionFeedback("");
          }}
          onResolve={handleResolveDoubt}
          rating={resolutionRating}
          setRating={setResolutionRating}
          feedback={resolutionFeedback}
          setFeedback={setResolutionFeedback}
          isLoading={isResolving}
        />
      )}
    </div>
  );
};

export default DoubtsManagement;
// =======================================
// DOUBT MODAL (Create/Edit) with Student Integration
// =============================================

import { useGetStudentsQuery } from "@/store/api/studentApi";

interface DoubtModalProps {
  mode: "create" | "edit";
  doubt?: Doubt | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const DoubtModal = ({
  mode,
  doubt,
  onClose,
  onSubmit,
  isLoading,
}: DoubtModalProps) => {
  const [form, setForm] = useState({
    title: doubt?.title || "",
    description: doubt?.description || "",
    studentId: doubt?.studentId || "",
    subject: doubt?.subject || "",
    topic: doubt?.topic || "",
    priority: doubt?.priority || "MEDIUM",
    tags: doubt?.tags?.join(", ") || "",
    isPrivate: doubt?.isPrivate || false,
  });

  // Fetch students for dropdown
  const { data: studentsData, isLoading: isLoadingStudents } =
    useGetStudentsQuery({
      page: 1,
      limit: 100,
      isActive: true,
    });

  const students = studentsData?.data || [];

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
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Doubt" : "Edit Doubt"}
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
              placeholder="e.g., Help with Quantum Mechanics"
            />
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student *
            </label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select Student</option>
              {isLoadingStudents ? (
                <option value="" disabled>
                  Loading students...
                </option>
              ) : (
                students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.name}{" "}
                    {student.class ? `(Class ${student.class})` : ""} -{" "}
                    {student.user?.email}
                  </option>
                ))
              )}
            </select>
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

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
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
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Describe your doubt in detail..."
            />
          </div>

          {/* Tags */}
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
              placeholder="physics, quantum, homework"
            />
          </div>

          {/* Private */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPrivate"
              checked={form.isPrivate}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-300">
              Private (only visible to student and teachers)
            </span>
          </label>

          {/* Selected Student Info (for edit mode) */}
          {mode === "edit" && doubt?.student && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                <span className="font-medium">Current Student:</span>{" "}
                {doubt.student.name}
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
              disabled={isLoading || isLoadingStudents}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {(isLoading || isLoadingStudents) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Doubt"
                  : "Update Doubt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW DOUBT MODAL
// =============================================

interface ViewDoubtModalProps {
  doubt: Doubt;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onViewAnswers: () => void;
  onAssignTeacher: () => void;
  onResolve: () => void;
}

const ViewDoubtModal = ({
  doubt,
  isLoading,
  onClose,
  onEdit,
  onViewAnswers,
  onAssignTeacher,
  onResolve,
}: ViewDoubtModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500/20 text-blue-400";
      case "ANSWERED":
        return "bg-yellow-500/20 text-yellow-400";
      case "RESOLVED":
        return "bg-green-500/20 text-green-400";
      case "CLOSED":
        return "bg-gray-500/20 text-gray-400";
      case "ESCALATED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/20 text-red-400";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400";
      case "LOW":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
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
            <p className="text-white text-lg">Loading doubt details...</p>
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
            <HelpCircle className="w-5 h-5 text-blue-400" />
            Doubt Details
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
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{doubt.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doubt.status)}`}
                >
                  {doubt.status}
                </span>
                {doubt.priority && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(doubt.priority)}`}
                  >
                    {doubt.priority} Priority
                  </span>
                )}
                {doubt.subject && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    {doubt.subject}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {doubt.status === "OPEN" && (
                <button
                  onClick={onAssignTeacher}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Assign Teacher
                </button>
              )}
              {doubt.status === "ANSWERED" && (
                <button
                  onClick={onResolve}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Resolve
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

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Student Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Name:{" "}
                  <span className="text-white">{doubt.student?.name}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Student ID:{" "}
                  <span className="text-white">{doubt.studentId}</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Assignment Info
              </h4>
              <div className="space-y-2">
                {doubt.assignedTo ? (
                  <>
                    <p className="text-sm text-gray-400">
                      Assigned To:{" "}
                      <span className="text-white">{doubt.teacher?.name}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Assigned At:{" "}
                      <span className="text-white">
                        {formatDate(doubt.assignedAt)}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Not assigned yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
            <h4 className="text-white font-medium mb-2">Description</h4>
            <p className="text-gray-400 whitespace-pre-wrap">
              {doubt.description || "No description provided"}
            </p>
          </div>

          {/* Tags */}
          {doubt.tags && doubt.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {doubt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <p className="text-xs text-gray-400">Views</p>
              <p className="text-xl font-bold text-white">{doubt.viewCount}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-xs text-gray-400">Upvotes</p>
              <p className="text-xl font-bold text-white">
                {doubt.upvoteCount}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-center">
              <p className="text-xs text-gray-400">Answers</p>
              <p className="text-xl font-bold text-white">
                {doubt._count?.answers || 0}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h4 className="text-white font-medium mb-2">Timeline</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Created: {formatDate(doubt.createdAt)}
              </p>
              {doubt.resolvedAt && (
                <p className="text-sm text-gray-400">
                  Resolved: {formatDate(doubt.resolvedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300"
            >
              Close
            </button>
            <button
              onClick={onViewAnswers}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              View Answers ({doubt._count?.answers || 0})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// ANSWERS MODAL
// =============================================

interface AnswersModalProps {
  doubt: Doubt;
  answers: DoubtAnswer[];
  onClose: () => void;
  onAddAnswer: () => void;
  onAcceptAnswer: (answerId: string) => void;
  onUpvoteAnswer: (answerId: string) => void;
  onDeleteAnswer: (answerId: string) => void;
  answerContent: string;
  setAnswerContent: (content: string) => void;
  isAddingAnswer: boolean;
}

const AnswersModal = ({
  doubt,
  answers,
  onClose,
  onAddAnswer,
  onAcceptAnswer,
  onUpvoteAnswer,
  onDeleteAnswer,
  answerContent,
  setAnswerContent,
  isAddingAnswer,
}: AnswersModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Answers - {doubt.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Answer Form */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-white font-medium mb-3">Add Your Answer</h4>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white mb-3"
              placeholder="Write your answer here..."
            />
            <button
              onClick={onAddAnswer}
              disabled={!answerContent.trim() || isAddingAnswer}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isAddingAnswer ? "Posting..." : "Post Answer"}
            </button>
          </div>

          {/* Answers List */}
          <div className="space-y-4">
            {answers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No answers yet. Be the first to answer!
              </div>
            ) : (
              answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-4 rounded-lg ${
                    answer.isAccepted
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {answer.teacher
                            ? answer.teacher.name.charAt(0)
                            : answer.student?.name?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {answer.teacher?.name ||
                            answer.student?.name ||
                            "Unknown"}
                          {answer.isOfficial && (
                            <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                              Official
                            </span>
                          )}
                          {answer.isAccepted && (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              Accepted Solution
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(answer.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpvoteAnswer(answer.id)}
                        className="p-1 hover:bg-white/5 rounded"
                      >
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <span className="text-sm text-gray-300">
                        {answer.upvotes}
                      </span>
                      {!answer.isAccepted && doubt.status !== "RESOLVED" && (
                        <button
                          onClick={() => onAcceptAnswer(answer.id)}
                          className="p-1 hover:bg-green-500/10 rounded ml-2"
                          title="Accept as solution"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteAnswer(answer.id)}
                        className="p-1 hover:bg-red-500/10 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {answer.content}
                  </p>
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
// ASSIGN MODAL
// =============================================

interface AssignModalProps {
  doubt: Doubt;
  teachers: any[];
  onClose: () => void;
  onAssign: () => void;
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  isLoading: boolean;
}

const AssignModal = ({
  doubt,
  teachers,
  onClose,
  onAssign,
  selectedTeacherId,
  setSelectedTeacherId,
  isLoading,
}: AssignModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Assign Teacher</h2>
          <p className="text-sm text-gray-400 mt-1">Doubt: {doubt.title}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="">Choose a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}{" "}
                  {teacher.qualification ? `(${teacher.qualification})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={onAssign}
              disabled={!selectedTeacherId || isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {isLoading ? "Assigning..." : "Assign Teacher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// RESOLVE MODAL
// =============================================

interface ResolveModalProps {
  doubt: Doubt;
  onClose: () => void;
  onResolve: () => void;
  rating: number;
  setRating: (rating: number) => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
  isLoading: boolean;
}

const ResolveModal = ({
  doubt,
  onClose,
  onResolve,
  rating,
  setRating,
  feedback,
  setFeedback,
  isLoading,
}: ResolveModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Resolve Doubt</h2>
          <p className="text-sm text-gray-400 mt-1">Doubt: {doubt.title}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`p-2 rounded-lg transition-colors ${
                    r <= rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="How was the response? Any suggestions?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={onResolve}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? "Resolving..." : "Mark as Resolved"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
