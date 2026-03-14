// src/app/dashboard/admin/quizzes/page.tsx
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
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Award,
  Activity,
  X,
  BarChart,
  TrendingUp,
  Users,
  Calendar,
  HelpCircle,
  List,
  Settings,
  Play,
  Pause,
  Copy,
  Download,
  Upload,
  Star,
  Target,
  Archive,
} from "lucide-react";

import {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizStatsQuery,
  useGetQuizAnalyticsQuery,
  useGetQuizQuestionsQuery,
  useGetQuizResultsQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  usePublishQuizMutation,
  useArchiveQuizMutation,
  useAddQuestionMutation,
  useAddBulkQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
} from "@/store/api/quizApi";
import { useGetTeachersQuery } from "@/store/api/teacherApi";
import { useGetBatchesQuery } from "@/store/api/batchApi";

// Types
interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  teacherId: string;
  batchId?: string | null;
  timeLimit?: number | null;
  totalMarks: number;
  passingMarks?: number | null;
  negativeMarking: number;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  subject?: string | null;
  topics: string[];
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
  };
  batch?: {
    id: string;
    name: string;
  };
  _count?: {
    questions: number;
    attempts: number;
  };
}

interface Question {
  id: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "MATCHING";
  options?: any;
  correctAnswer: any;
  marks: number;
  negativeMarks: number;
  difficulty: string;
  topic?: string | null;
  order: number;
}

interface Filters {
  search: string;
  status: string;
  difficulty: string;
  subject: string;
}

const QuizzesManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [questionsModal, setQuestionsModal] = useState(false);
  const [resultsModal, setResultsModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    difficulty: "",
    subject: "",
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: quizzesData,
    isLoading,
    error,
    refetch,
  } = useGetQuizzesQuery({
    page,
    limit,
    search: filters.search || undefined,
    status: filters.status || undefined,
    difficulty: filters.difficulty || undefined,
    subject: filters.subject || undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetQuizStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleQuiz, refetch: refetchQuiz } = useGetQuizByIdQuery(
    selectedQuiz?.id || "",
    { skip: !selectedQuiz?.id },
  );

  const { data: quizQuestions, refetch: refetchQuestions } =
    useGetQuizQuestionsQuery(selectedQuiz?.id || "", {
      skip: !selectedQuiz?.id,
    });

  const { data: quizResults } = useGetQuizResultsQuery(
    { quizId: selectedQuiz?.id || "", page: 1, limit: 10 },
    { skip: !selectedQuiz?.id },
  );

  const { data: quizAnalytics, refetch: refetchAnalytics } =
    useGetQuizAnalyticsQuery(selectedQuiz?.id || "", {
      skip: !selectedQuiz?.id,
    });

  const quizzes = quizzesData?.data || [];
  const meta = quizzesData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();
  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [archiveQuiz, { isLoading: isArchiving }] = useArchiveQuizMutation();
  const [addQuestion, { isLoading: isAddingQuestion }] =
    useAddQuestionMutation();
  const [addBulkQuestions, { isLoading: isAddingBulk }] =
    useAddBulkQuestionsMutation();
  const [updateQuestion, { isLoading: isUpdatingQuestion }] =
    useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: isDeletingQuestion }] =
    useDeleteQuestionMutation();
  const [reorderQuestions, { isLoading: isReordering }] =
    useReorderQuestionsMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singleQuiz && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singleQuiz, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    const result = await Swal.fire({
      title: "Delete Quiz?",
      text: `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
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
        await deleteQuiz(quiz.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Quiz has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedQuiz?.id === quiz.id) {
          setSelectedQuiz(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete quiz",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handlePublish = async (id: string) => {
    const result = await Swal.fire({
      title: "Publish Quiz?",
      text: "This quiz will be available for students to attempt.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, publish",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await publishQuiz(id).unwrap();
        Swal.fire({
          title: "Success!",
          text: "Quiz published successfully.",
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
          text: error.data?.message || "Failed to publish quiz",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleArchive = async (id: string) => {
    const result = await Swal.fire({
      title: "Archive Quiz?",
      text: "This quiz will be moved to archives.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, archive",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await archiveQuiz(id).unwrap();
        Swal.fire({
          title: "Success!",
          text: "Quiz archived successfully.",
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
          text: error.data?.message || "Failed to archive quiz",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleCreateQuiz = async (data: any) => {
    try {
      await createQuiz(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Quiz created successfully",
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
        text: error.data?.message || "Failed to create quiz",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdateQuiz = async (id: string, data: any) => {
    try {
      await updateQuiz({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Quiz updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedQuiz(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update quiz",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleAddQuestion = async (quizId: string, data: any) => {
    try {
      await addQuestion({ quizId, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Question added successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetchQuestions();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to add question",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleDeleteQuestion = async (quizId: string, questionId: string) => {
    const result = await Swal.fire({
      title: "Delete Question?",
      text: "Are you sure you want to delete this question?",
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
        await deleteQuestion({ quizId, questionId }).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Question deleted successfully",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchQuestions();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete question",
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
      status: "",
      difficulty: "",
      subject: "",
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
      case "PUBLISHED":
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
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
          <BookOpen className="w-8 h-8 text-blue-400" />
          Quiz Management
        </h1>
        <p className="text-gray-400">Create and manage quizzes for students</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Quizzes</h3>
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
              <h3 className="text-gray-400 text-sm">Total Attempts</h3>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.attempts || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Avg. Score</h3>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.averageScore.toFixed(1)}%
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
              Create Quiz
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
              placeholder="Search quizzes..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
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

      {/* Quizzes Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load quizzes</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Quiz
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Subject
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Difficulty
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Questions
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Attempts
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Avg. Score
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
                  {quizzes.map((quiz: Quiz) => (
                    <tr
                      key={quiz.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(quiz)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {quiz.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {quiz.teacher?.name || "Unknown"} •{" "}
                              {quiz._count?.questions || 0} questions
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          {quiz.subject || "N/A"}
                        </p>
                        {quiz.batch && (
                          <p className="text-xs text-gray-500">
                            {quiz.batch.name}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}
                        >
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}
                        >
                          {quiz.status === "PUBLISHED" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {quiz.status === "DRAFT" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {quiz.status === "ARCHIVED" && (
                            <XCircle className="w-3 h-3" />
                          )}
                          {quiz.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-white text-sm">
                            {quiz._count?.questions || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm">
                            {quiz.totalAttempts || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">
                            {quiz.averageScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {formatDate(quiz.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuiz(quiz);
                              setQuestionsModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Manage Questions"
                          >
                            <List className="w-4 h-4 text-blue-400" />
                          </button>
                          {quiz.status === "DRAFT" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublish(quiz.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Publish"
                              disabled={isPublishing}
                            >
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          {quiz.status === "PUBLISHED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(quiz.id);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Archive"
                              disabled={isArchiving}
                            >
                              <Archive className="w-4 h-4 text-yellow-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuiz(quiz);
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
                              handleDelete(quiz);
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
                  quizzes
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
        <QuizModal
          mode="create"
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreateQuiz}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedQuiz && (
        <QuizModal
          mode="edit"
          quiz={selectedQuiz}
          onClose={() => {
            setEditModal(false);
            setSelectedQuiz(null);
          }}
          onSubmit={(data) => handleUpdateQuiz(selectedQuiz.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedQuiz && (
        <ViewQuizModal
          quiz={singleQuiz || selectedQuiz}
          questions={quizQuestions || []}
          analytics={quizAnalytics?.data}
          results={quizResults?.data || []}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedQuiz(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onManageQuestions={() => {
            setViewModal(false);
            setQuestionsModal(true);
          }}
          onViewResults={() => {
            setViewModal(false);
            setResultsModal(true);
          }}
          onViewAnalytics={() => {
            setViewModal(false);
            setAnalyticsModal(true);
          }}
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      )}

      {questionsModal && selectedQuiz && (
        <QuestionsModal
          quiz={selectedQuiz}
          questions={quizQuestions || []}
          onClose={() => {
            setQuestionsModal(false);
            setSelectedQuiz(null);
          }}
          onAddQuestion={(data) => handleAddQuestion(selectedQuiz.id, data)}
          onDeleteQuestion={(questionId) =>
            handleDeleteQuestion(selectedQuiz.id, questionId)
          }
          isLoading={isAddingQuestion || isDeletingQuestion}
        />
      )}

      {resultsModal && selectedQuiz && (
        <ResultsModal
          quiz={selectedQuiz}
          results={quizResults?.data || []}
          onClose={() => {
            setResultsModal(false);
            setSelectedQuiz(null);
          }}
        />
      )}

      {analyticsModal && selectedQuiz && (
        <AnalyticsModal
          quiz={selectedQuiz}
          analytics={quizAnalytics?.data}
          onClose={() => {
            setAnalyticsModal(false);
            setSelectedQuiz(null);
          }}
        />
      )}
    </div>
  );
};

export default QuizzesManagement;

// =============================================
// QUIZ MODAL (Create/Edit) with Teacher & Batch
// =============================================

interface QuizModalProps {
  mode: "create" | "edit";
  quiz?: Quiz | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const QuizModal = ({
  mode,
  quiz,
  onClose,
  onSubmit,
  isLoading,
}: QuizModalProps) => {
  const [form, setForm] = useState({
    title: quiz?.title || "",
    description: quiz?.description || "",
    teacherId: quiz?.teacherId || "",
    batchId: quiz?.batchId || "",
    subject: quiz?.subject || "",
    difficulty: quiz?.difficulty || "INTERMEDIATE",
    timeLimit: quiz?.timeLimit || 30,
    totalMarks: quiz?.totalMarks || 100,
    passingMarks: quiz?.passingMarks || 40,
    negativeMarking: quiz?.negativeMarking || 0,
    allowRetake: quiz?.allowRetake || false,
    maxAttempts: quiz?.maxAttempts || 1,
    showResult: quiz?.showResult ?? true,
    showAnswer: quiz?.showAnswer ?? false,
    showExplanation: quiz?.showExplanation ?? true,
    showLeaderboard: quiz?.showLeaderboard ?? true,
    topics: quiz?.topics?.join(", ") || "",
  });

  // Fetch teachers for dropdown
  const { data: teachersData, isLoading: isLoadingTeachers } =
    useGetTeachersQuery({
      page: 1,
      limit: 100,
      isActive: true,
    });

  // Fetch batches for dropdown
  const { data: batchesData, isLoading: isLoadingBatches } = useGetBatchesQuery(
    {
      page: 1,
      limit: 100,
      isActive: true,
    },
  );

  const teachers = teachersData?.data || [];
  const batches = batchesData?.data || [];

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
      teacherId: form.teacherId || undefined,
      batchId: form.batchId || undefined,
      topics: form.topics
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      timeLimit: parseInt(form.timeLimit.toString()),
      totalMarks: parseInt(form.totalMarks.toString()),
      passingMarks: parseInt(form.passingMarks.toString()),
      negativeMarking: parseFloat(form.negativeMarking.toString()),
      maxAttempts: parseInt(form.maxAttempts.toString()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Quiz" : "Edit Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="e.g., Quantum Mechanics Basics"
            />
          </div>

          {/* Teacher and Batch Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teacher *
              </label>
              <select
                name="teacherId"
                value={form.teacherId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="">Select Teacher</option>
                {isLoadingTeachers ? (
                  <option value="" disabled>
                    Loading teachers...
                  </option>
                ) : (
                  teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}{" "}
                      {teacher.qualification
                        ? `(${teacher.qualification})`
                        : ""}
                    </option>
                  ))
                )}
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
                <option value="">All Batches (Public)</option>
                {isLoadingBatches ? (
                  <option value="" disabled>
                    Loading batches...
                  </option>
                ) : (
                  batches.map((batch: any) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} - {batch.subject}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to make quiz available to all students
              </p>
            </div>
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
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Brief description of the quiz..."
            />
          </div>

          {/* Subject and Difficulty */}
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

          {/* Time, Marks, Passing Marks */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Limit (min)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={form.timeLimit}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passing Marks
              </label>
              <input
                type="number"
                name="passingMarks"
                value={form.passingMarks}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Negative Marking */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Negative Marking (per question)
            </label>
            <input
              type="number"
              name="negativeMarking"
              value={form.negativeMarking}
              onChange={handleChange}
              min="0"
              step="0.25"
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            />
          </div>

          {/* Topics */}
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
              placeholder="Quantum Mechanics, Wave Function, Schrödinger Equation"
            />
          </div>

          {/* Retake Settings */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowRetake"
                checked={form.allowRetake}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Allow Retake</span>
            </label>

            {form.allowRetake && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Attempts
                </label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={form.maxAttempts}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                />
              </div>
            )}
          </div>

          {/* Display Settings */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showResult"
                checked={form.showResult}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">
                Show Result Immediately
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showAnswer"
                checked={form.showAnswer}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">
                Show Correct Answers
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showExplanation"
                checked={form.showExplanation}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Show Explanations</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showLeaderboard"
                checked={form.showLeaderboard}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Show Leaderboard</span>
            </label>
          </div>

          {/* Selected Teacher Info (for edit mode) */}
          {mode === "edit" && quiz?.teacher && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                <span className="font-medium">Current Teacher:</span>{" "}
                {quiz.teacher.name}
                {quiz.teacher.qualification &&
                  ` (${quiz.teacher.qualification})`}
              </p>
            </div>
          )}

          {/* Selected Batch Info (for edit mode) */}
          {mode === "edit" && quiz?.batch && (
            <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-400">
                <span className="font-medium">Current Batch:</span>{" "}
                {quiz.batch.name}
              </p>
            </div>
          )}

          {/* Form Actions */}
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
              disabled={isLoading || isLoadingTeachers || isLoadingBatches}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {(isLoading || isLoadingTeachers || isLoadingBatches) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Quiz"
                  : "Update Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW QUIZ MODAL
// =============================================

interface ViewQuizModalProps {
  quiz: Quiz;
  questions: Question[];
  analytics?: any;
  results?: any[];
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onManageQuestions: () => void;
  onViewResults: () => void;
  onViewAnalytics: () => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
}

const ViewQuizModal = ({
  quiz,
  questions,
  analytics,
  results,
  isLoading,
  onClose,
  onEdit,
  onManageQuestions,
  onViewResults,
  onViewAnalytics,
  onPublish,
  onArchive,
}: ViewQuizModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "questions" | "results" | "analytics"
  >("overview");

  // Define color functions inside the component
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (minutes?: number | null) => {
    if (!minutes) return "No limit";
    return `${minutes} minutes`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white text-lg">Loading quiz details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Quiz Details
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
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{quiz.title}</h3>
              <p className="text-gray-400">
                {quiz.description || "No description"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}
                >
                  {quiz.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}
                >
                  {quiz.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  {quiz.subject || "General"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {quiz.status === "DRAFT" && (
                <button
                  onClick={() => onPublish(quiz.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Publish
                </button>
              )}
              {quiz.status === "PUBLISHED" && (
                <button
                  onClick={() => onArchive(quiz.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Archive
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

          {/* Teacher & Batch Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {quiz.teacher && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-gray-400">Teacher</p>
                <p className="text-white font-medium">{quiz.teacher.name}</p>
                {quiz.teacher.qualification && (
                  <p className="text-xs text-gray-500">
                    {quiz.teacher.qualification}
                  </p>
                )}
              </div>
            )}
            {quiz.batch && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-xs text-gray-400">Batch</p>
                <p className="text-white font-medium">{quiz.batch.name}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "overview"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "questions"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "results"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "analytics"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Total Marks</p>
                  <p className="text-2xl font-bold text-white">
                    {quiz.totalMarks}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Passing Marks</p>
                  <p className="text-2xl font-bold text-green-400">
                    {quiz.passingMarks || 0}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Time Limit</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatTime(quiz.timeLimit)}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Negative Marking</p>
                  <p className="text-2xl font-bold text-red-400">
                    {quiz.negativeMarking}
                  </p>
                </div>
              </div>

              {/* Topics */}
              {quiz.topics?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {quiz.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              <div>
                <h4 className="text-white font-medium mb-2">Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${quiz.allowRetake ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-sm text-gray-300">
                      {quiz.allowRetake
                        ? `Allow Retake (Max ${quiz.maxAttempts})`
                        : "No Retake Allowed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${quiz.showResult ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-sm text-gray-300">Show Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${quiz.showAnswer ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-sm text-gray-300">Show Answers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${quiz.showExplanation ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-sm text-gray-300">
                      Show Explanations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${quiz.showLeaderboard ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-sm text-gray-300">
                      Show Leaderboard
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-white">
                    {quiz.totalAttempts}
                  </p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-gray-400">Average Score</p>
                  <p className="text-2xl font-bold text-green-400">
                    {quiz.averageScore.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <p className="text-sm text-gray-400">Pass Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {quiz.passRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">Questions</h4>
                <button
                  onClick={onManageQuestions}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Manage Questions
                </button>
              </div>
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No questions added yet
                  </p>
                ) : (
                  questions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-blue-400 w-6">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-white">{q.text}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-gray-500">
                              Marks: {q.marks}
                            </span>
                            {q.negativeMarks > 0 && (
                              <span className="text-red-400">
                                Negative: {q.negativeMarks}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full ${getDifficultyColor(q.difficulty)}`}
                            >
                              {q.difficulty}
                            </span>
                            {q.topic && (
                              <span className="text-gray-500">
                                Topic: {q.topic}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "results" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">Recent Results</h4>
                <button
                  onClick={onViewResults}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>
              {results?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No results yet</p>
              ) : (
                <div className="space-y-3">
                  {results?.slice(0, 5).map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {result.student?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Score: {result.obtainedMarks}/{result.totalMarks}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {result.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          Rank: {result.rank || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.totalAttempts}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analytics.passRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Avg. Time</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(analytics.timeAnalysis?.avg_time_seconds / 60)}{" "}
                    min
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">
                  Question Analysis
                </h4>
                <div className="space-y-3">
                  {analytics.questionAnalysis?.map((q: any) => (
                    <div key={q.id} className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-white text-sm mb-2">{q.text}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-400">
                          Attempts: {q.attempt_count}
                        </span>
                        <span className="text-green-400">
                          Correct Rate: {(q.correct_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <button
              onClick={onManageQuestions}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Manage Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// =============================================
// QUESTIONS MODAL
// =============================================

interface QuestionsModalProps {
  quiz: Quiz;
  questions: Question[];
  onClose: () => void;
  onAddQuestion: (data: any) => void;
  onDeleteQuestion: (questionId: string) => void;
  isLoading?: boolean;
}

const QuestionsModal = ({
  quiz,
  questions,
  onClose,
  onAddQuestion,
  onDeleteQuestion,
  isLoading,
}: QuestionsModalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    text: "",
    type: "MCQ",
    options: "",
    correctAnswer: "",
    marks: 1,
    negativeMarks: 0,
    explanation: "",
    difficulty: "INTERMEDIATE",
    topic: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let options = undefined;
    let correctAnswer = form.correctAnswer;

    if (form.type === "MCQ") {
      options = form.options
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt);
      correctAnswer = parseInt(form.correctAnswer) || 0;
    } else if (form.type === "TRUE_FALSE") {
      correctAnswer = form.correctAnswer === "true";
    }

    onAddQuestion({
      ...form,
      options,
      correctAnswer,
      marks: parseInt(form.marks.toString()),
      negativeMarks: parseFloat(form.negativeMarks.toString()),
    });

    setShowAddForm(false);
    setForm({
      text: "",
      type: "MCQ",
      options: "",
      correctAnswer: "",
      marks: 1,
      negativeMarks: 0,
      explanation: "",
      difficulty: "INTERMEDIATE",
      topic: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Questions - {quiz.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">
              All Questions ({questions.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              {showAddForm ? "Cancel" : "Add Question"}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-gray-800/50 rounded-lg space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              {form.type === "MCQ" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Options (one per line) *
                  </label>
                  <textarea
                    value={form.options}
                    onChange={(e) =>
                      setForm({ ...form, options: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                    placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {form.type === "MCQ"
                      ? "Correct Option (0-based index)"
                      : "Correct Answer"}
                  </label>
                  {form.type === "TRUE_FALSE" ? (
                    <select
                      value={form.correctAnswer}
                      onChange={(e) =>
                        setForm({ ...form, correctAnswer: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                      required
                    >
                      <option value="">Select</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={form.correctAnswer}
                      onChange={(e) =>
                        setForm({ ...form, correctAnswer: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                      min="0"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={(e) =>
                      setForm({ ...form, marks: e.target.value })
                    }
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Negative
                  </label>
                  <input
                    type="number"
                    value={form.negativeMarks}
                    onChange={(e) =>
                      setForm({ ...form, negativeMarks: e.target.value })
                    }
                    min="0"
                    step="0.25"
                    className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Explanation
                </label>
                <textarea
                  value={form.explanation}
                  onChange={(e) =>
                    setForm({ ...form, explanation: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Question"}
              </button>
            </form>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
            {questions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No questions added yet
              </p>
            ) : (
              questions.map((q, index) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-400">
                        Q{index + 1}.
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-white">{q.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Marks: {q.marks}</span>
                      {q.negativeMarks > 0 && (
                        <span>Negative: {q.negativeMarks}</span>
                      )}
                      {q.topic && <span>Topic: {q.topic}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
// RESULTS MODAL
// =============================================

interface ResultsModalProps {
  quiz: Quiz;
  results: any[];
  onClose: () => void;
}

const ResultsModal = ({ quiz, results, onClose }: ResultsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Quiz Results - {quiz.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {results.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No results available
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">
                      {result.student?.name}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        result.percentage >= (quiz.passingMarks || 40)
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {result.percentage >= (quiz.passingMarks || 40)
                        ? "Passed"
                        : "Failed"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Score</p>
                      <p className="text-white">
                        {result.obtainedMarks}/{result.totalMarks}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Percentage</p>
                      <p className="text-white">
                        {result.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Rank</p>
                      <p className="text-white">{result.rank || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="text-white">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================
// ANALYTICS MODAL
// =============================================

interface AnalyticsModalProps {
  quiz: Quiz;
  analytics?: any;
  onClose: () => void;
}

const AnalyticsModal = ({ quiz, analytics, onClose }: AnalyticsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Quiz Analytics - {quiz.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {!analytics ? (
            <p className="text-gray-400 text-center py-8">
              No analytics available
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.totalAttempts}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Average Score</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analytics.averageScore?.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Pass Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {analytics.passRate?.toFixed(1)}%
                  </p>
                </div>
              </div>

              {analytics.timeAnalysis && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Time Analysis</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Average Time</p>
                      <p className="text-white font-medium">
                        {Math.round(
                          analytics.timeAnalysis.avg_time_seconds / 60,
                        )}{" "}
                        min{" "}
                        {Math.round(
                          analytics.timeAnalysis.avg_time_seconds % 60,
                        )}{" "}
                        sec
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Fastest</p>
                      <p className="text-white font-medium">
                        {Math.round(
                          analytics.timeAnalysis.min_time_seconds / 60,
                        )}{" "}
                        min{" "}
                        {Math.round(
                          analytics.timeAnalysis.min_time_seconds % 60,
                        )}{" "}
                        sec
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Slowest</p>
                      <p className="text-white font-medium">
                        {Math.round(
                          analytics.timeAnalysis.max_time_seconds / 60,
                        )}{" "}
                        min{" "}
                        {Math.round(
                          analytics.timeAnalysis.max_time_seconds % 60,
                        )}{" "}
                        sec
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analytics.questionAnalysis && (
                <div>
                  <h4 className="text-white font-medium mb-3">
                    Question Performance
                  </h4>
                  <div className="space-y-3">
                    {analytics.questionAnalysis.map((q: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-800/50 rounded-lg"
                      >
                        <p className="text-white text-sm mb-2">{q.text}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-gray-400">
                            Attempts: {q.attempt_count}
                          </span>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-400"
                              style={{ width: `${q.correct_rate * 100}%` }}
                            />
                          </div>
                          <span className="text-green-400">
                            {(q.correct_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
