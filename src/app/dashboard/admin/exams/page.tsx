// src/app/dashboard/admin/exams/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
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
} from "lucide-react";

import {
  useGetExamsQuery,
  useGetExamByIdQuery,
  useGetExamStatsQuery,
  useGetExamResultsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useUpdateExamStatusMutation,
  usePublishExamResultsMutation,
  useSaveExamResultsMutation,
  useBulkExamActionMutation,
} from "@/store/api/examApi";
import { useGetBatchesQuery } from "@/store/api/batchApi";
import { useGetTeachersQuery } from "@/store/api/teacherApi";

// Types
// Update the Exam interface to include teacher and batch
interface Exam {
  id: string;
  title: string;
  description?: string | null;
  teacherId: string;
  batchId?: string | null;
  type: string;
  subject: string;
  fullMarks: number;
  passMarks?: number | null;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  gradingType: string;
  isResultPublished: boolean;
  status: string;
  totalStudents: number;
  appearedCount: number;
  passedCount: number;
  averageMarks: number;
  highestMarks: number;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
  };
  batch?: {
    id: string;
    name: string;
    subject: string;
  };
  _count?: {
    results: number;
  };
}

interface ExamResult {
  id: string;
  studentId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string | null;
  rank?: number | null;
  feedback?: string | null;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    class?: string | null;
    rollNumber?: string | null;
  };
}

interface Filters {
  search: string;
  status: string;
  type: string;
  subject: string;
  fromDate: string;
  toDate: string;
}

const ExamManagementPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [resultsModal, setResultsModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    type: "",
    subject: "",
    fromDate: "",
    toDate: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: examsData,
    isLoading,
    error,
    refetch,
  } = useGetExamsQuery({
    page,
    limit,
    search: filters.search || undefined,
    status: filters.status || undefined,
    type: filters.type || undefined,
    subject: filters.subject || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetExamStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleExam, refetch: refetchExam } = useGetExamByIdQuery(
    selectedExam?.id || "",
    { skip: !selectedExam?.id },
  );

  console.log(singleExam);

  const { data: examResults, refetch: refetchResults } = useGetExamResultsQuery(
    { examId: selectedExam?.id || "", page: 1, limit: 50 },
    { skip: !selectedExam?.id },
  );

  const exams = examsData?.data || [];
  const meta = examsData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateExamStatusMutation();
  const [publishResults, { isLoading: isPublishing }] =
    usePublishExamResultsMutation();
  const [saveResults, { isLoading: isSavingResults }] =
    useSaveExamResultsMutation();
  const [bulkAction, { isLoading: isBulkAction }] = useBulkExamActionMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singleExam && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singleExam, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (exam: Exam) => {
    setSelectedExam(exam);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (exam: Exam) => {
    const result = await Swal.fire({
      title: "Delete Exam?",
      text: `Are you sure you want to delete "${exam.title}"? This action cannot be undone.`,
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
        await deleteExam(exam.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Exam has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedExam?.id === exam.id) {
          setSelectedExam(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete exam",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: string,
    publishResults?: boolean,
  ) => {
    try {
      await updateStatus({ id, data: { status, publishResults } }).unwrap();
      Swal.fire({
        title: "Success!",
        text: `Exam status updated to ${status}`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetch();
      refetchStats();
      if (selectedExam?.id === id) {
        refetchExam();
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update status",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handlePublishResults = async (id: string) => {
    const result = await Swal.fire({
      title: "Publish Results?",
      text: "This will make results visible to all students.",
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
        await publishResults(id).unwrap();
        Swal.fire({
          title: "Success!",
          text: "Results published successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetch();
        refetchStats();
        if (selectedExam?.id === id) {
          refetchExam();
          refetchResults();
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to publish results",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleBulkAction = async (
    action: "publish" | "archive" | "delete" | "publishResults",
  ) => {
    if (!selectedExams.length) {
      Swal.fire({
        title: "No exams selected",
        text: "Please select at least one exam",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}d`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedExams.length} exams?`,
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
          examIds: selectedExams,
          action,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedExams.length} exams ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedExams([]);
        setSelectAll(false);
        refetch();
        refetchStats();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} exams`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleSelect = (id: string) => {
    if (selectedExams.includes(id)) {
      setSelectedExams(selectedExams.filter((s) => s !== id));
    } else {
      setSelectedExams([...selectedExams, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedExams([]);
    } else {
      setSelectedExams(exams.map((e: Exam) => e.id));
    }
    setSelectAll(!selectAll);
  };

  const handleCreateExam = async (data: any) => {
    try {
      await createExam(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Exam created successfully",
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
        text: error.data?.message || "Failed to create exam",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdateExam = async (id: string, data: any) => {
    try {
      await updateExam({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Exam updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedExam(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update exam",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSaveResults = async (examId: string, results: any[]) => {
    try {
      await saveResults({ examId, data: { results } }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Results saved successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetchResults();
      refetchExam();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to save results",
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
      type: "",
      subject: "",
      fromDate: "",
      toDate: "",
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

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ONGOING":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "COMPLETED":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "RESULT_PUBLISHED":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "DRAFT":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      case "ARCHIVED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-400" />
          Exam Management
        </h1>
        <p className="text-gray-400">
          Create and manage exams, track student performance
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Exams</h3>
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Upcoming</h3>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.upcoming || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Completed</h3>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.completed || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Avg. Marks</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.averageMarks.toFixed(1)}%
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
              Create Exam
            </button>
            <button
              onClick={() => setBulkActionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              disabled={selectedExams.length === 0}
            >
              <Users className="w-4 h-4" />
              Bulk Actions ({selectedExams.length})
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
              placeholder="Search exams..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RESULT_PUBLISHED">Results Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

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
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="MODEL_TEST">Model Test</option>
                  <option value="FINAL">Final</option>
                  <option value="MOCK">Mock</option>
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
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => {
                    setFilters({ ...filters, fromDate: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => {
                    setFilters({ ...filters, toDate: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
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
      {selectedExams.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedExams.length}</span> exams
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
              onClick={() => handleBulkAction("archive")}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
            >
              Archive
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

      {/* Exams Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load exams</p>
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
                        checked={selectAll && exams.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Exam
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Type
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Date
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Students
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Pass Rate
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Results
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam: Exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(exam)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedExams.includes(exam.id)}
                          onChange={() => handleSelect(exam.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {exam.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {exam.subject} • {exam.teacher?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {exam.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-white text-sm">
                            {formatDate(exam.examDate)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {exam.duration} mins
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}
                        >
                          {exam.status === "SCHEDULED" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {exam.status === "ONGOING" && (
                            <Activity className="w-3 h-3" />
                          )}
                          {exam.status === "COMPLETED" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {exam.status === "RESULT_PUBLISHED" && (
                            <Award className="w-3 h-3" />
                          )}
                          {exam.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-white text-sm">
                            {exam.appearedCount}/{exam.totalStudents}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">
                            {exam.totalStudents > 0
                              ? Math.round(
                                  (exam.passedCount / exam.totalStudents) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {exam.isResultPublished ? (
                          <span className="text-green-400 text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Published
                          </span>
                        ) : (
                          <span className="text-yellow-400 text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExam(exam);
                              setResultsModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Results"
                            disabled={
                              !exam.isResultPublished &&
                              exam.status !== "COMPLETED"
                            }
                          >
                            <Award className="w-4 h-4 text-purple-400" />
                          </button>
                          {exam.status === "COMPLETED" &&
                            !exam.isResultPublished && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublishResults(exam.id);
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                title="Publish Results"
                                disabled={isPublishing}
                              >
                                <Send className="w-4 h-4 text-green-400" />
                              </button>
                            )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExam(exam);
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
                              handleDelete(exam);
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
                  exams
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
        <ExamModal
          mode="create"
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreateExam}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedExam && (
        <ExamModal
          mode="edit"
          exam={selectedExam}
          onClose={() => {
            setEditModal(false);
            setSelectedExam(null);
          }}
          onSubmit={(data) => handleUpdateExam(selectedExam.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedExam && (
        <ViewExamModal
          exam={singleExam || selectedExam}
          results={examResults?.data || []}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedExam(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onViewResults={() => {
            setViewModal(false);
            setResultsModal(true);
          }}
          onUpdateStatus={handleUpdateStatus}
          onPublishResults={handlePublishResults}
        />
      )}

      {resultsModal && selectedExam && (
        <ResultsModal
          exam={selectedExam}
          results={examResults?.data || []}
          onClose={() => {
            setResultsModal(false);
            setSelectedExam(null);
          }}
          onSaveResults={(results) =>
            handleSaveResults(selectedExam.id, results)
          }
          isLoading={isSavingResults}
        />
      )}

      {bulkActionModal && (
        <BulkActionModal
          selectedCount={selectedExams.length}
          onClose={() => setBulkActionModal(false)}
          onAction={handleBulkAction}
          isLoading={isBulkAction}
        />
      )}
    </div>
  );
};

export default ExamManagementPage;

// =============================================
// EXAM MODAL (Create/Edit)
// =============================================

interface ExamModalProps {
  mode: "create" | "edit";
  exam?: Exam | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const ExamModal = ({
  mode,
  exam,
  onClose,
  onSubmit,
  isLoading,
}: ExamModalProps) => {
  const [form, setForm] = useState({
    title: exam?.title || "",
    description: exam?.description || "",
    teacherId: exam?.teacherId || "",
    batchId: exam?.batchId || "",
    type: exam?.type || "EXAM",
    subject: exam?.subject || "",
    fullMarks: exam?.fullMarks || 100,
    passMarks: exam?.passMarks || 40,
    examDate: exam?.examDate?.split("T")[0] || "",
    startTime: exam?.startTime?.split("T")[1]?.substring(0, 5) || "09:00",
    endTime: exam?.endTime?.split("T")[1]?.substring(0, 5) || "12:00",
    duration: exam?.duration || 180,
    gradingType: exam?.gradingType || "AUTO",
    instructions: exam?.instructions || "",
    allowReview: exam?.allowReview ?? false,
    showRank: exam?.showRank ?? true,
    showPercentile: exam?.showPercentile ?? true,
    allowRecheck: exam?.allowRecheck ?? false,
    recheckFee: exam?.recheckFee || 0,
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

    const examDateTime = `${form.examDate}T${form.startTime}:00`;
    const endDateTime = `${form.examDate}T${form.endTime}:00`;

    onSubmit({
      ...form,
      teacherId: form.teacherId || undefined,
      batchId: form.batchId || undefined,
      examDate: examDateTime,
      startTime: examDateTime,
      endTime: endDateTime,
      fullMarks: parseInt(form.fullMarks.toString()),
      passMarks: parseInt(form.passMarks.toString()),
      duration: parseInt(form.duration.toString()),
      recheckFee: parseFloat(form.recheckFee.toString()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Exam" : "Edit Exam"}
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
              Exam Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="e.g., Physics Final Exam 2024"
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
                <option value="">All Batches (General)</option>
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
                Leave empty to make exam available to all students
              </p>
            </div>
          </div>

          {/* Type and Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="WEEKLY">Weekly Test</option>
                <option value="MONTHLY">Monthly Exam</option>
                <option value="MODEL_TEST">Model Test</option>
                <option value="FINAL">Final Exam</option>
                <option value="MOCK">Mock Test</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="e.g., Physics"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="examDate"
                value={form.examDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Duration and Marks */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Marks
              </label>
              <input
                type="number"
                name="fullMarks"
                value={form.fullMarks}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pass Marks
              </label>
              <input
                type="number"
                name="passMarks"
                value={form.passMarks}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Grading Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grading Type
            </label>
            <select
              name="gradingType"
              value={form.gradingType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="AUTO">Automatic</option>
              <option value="MANUAL">Manual</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Instructions
            </label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Exam instructions for students..."
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowReview"
                checked={form.allowReview}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Allow Review</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showRank"
                checked={form.showRank}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Show Rank</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showPercentile"
                checked={form.showPercentile}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Show Percentile</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowRecheck"
                checked={form.allowRecheck}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Allow Recheck</span>
            </label>
          </div>

          {form.allowRecheck && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recheck Fee (₹)
              </label>
              <input
                type="number"
                name="recheckFee"
                value={form.recheckFee}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          )}

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
              placeholder="Additional details about the exam..."
            />
          </div>

          {/* Selected Teacher Info (for edit mode) */}
          {mode === "edit" && exam?.teacher && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                <span className="font-medium">Current Teacher:</span>{" "}
                {exam.teacher.name}
                {exam.teacher.qualification &&
                  ` (${exam.teacher.qualification})`}
              </p>
            </div>
          )}

          {/* Selected Batch Info (for edit mode) */}
          {mode === "edit" && exam?.batch && (
            <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-400">
                <span className="font-medium">Current Batch:</span>{" "}
                {exam.batch.name}
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
              disabled={isLoading || isLoadingTeachers || isLoadingBatches}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {(isLoading || isLoadingTeachers || isLoadingBatches) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Exam"
                  : "Update Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW EXAM MODAL
// =============================================

interface ViewExamModalProps {
  exam: Exam;
  results: ExamResult[];
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onViewResults: () => void;
  onUpdateStatus: (
    id: string,
    status: string,
    publishResults?: boolean,
  ) => void;
  onPublishResults: (id: string) => void;
}

const ViewExamModal = ({
  exam,
  results,
  isLoading,
  onClose,
  onEdit,
  onViewResults,
  onUpdateStatus,
  onPublishResults,
}: ViewExamModalProps) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "results">(
    results.length > 0 ? "results" : "overview",
  );

  console.log(exam);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ONGOING":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "COMPLETED":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "RESULT_PUBLISHED":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
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

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Exam Details
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{exam.title}</h3>
              <p className="text-gray-400">
                {exam.description || "No description"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}
                >
                  {exam.status}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  {exam.type}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  {exam.subject}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {exam.status === "COMPLETED" && !exam.isResultPublished && (
                <button
                  onClick={() => onPublishResults(exam.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Publish Results
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

          {/* Status Update */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Update Exam Status</p>
                <p className="text-sm text-gray-400">Current: {exam.status}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                Change Status
                <ChevronDown className="w-4 h-4" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onUpdateStatus(exam.id, "SCHEDULED");
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-white/5"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(exam.id, "ONGOING");
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-white/5"
                    >
                      Start Exam
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(exam.id, "COMPLETED");
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-white/5"
                    >
                      Complete Exam
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(exam.id, "ARCHIVED");
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          {results.length > 0 && (
            <div className="flex gap-2 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "results"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Results ({results.length})
              </button>
            </div>
          )}

          {/* Content */}
          {activeTab === "overview" ? (
            <>
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Schedule
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Date:{" "}
                      <span className="text-white">
                        {formatDate(exam.examDate)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Time:{" "}
                      <span className="text-white">
                        {formatTime(exam.startTime)} -{" "}
                        {formatTime(exam.endTime)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Duration:{" "}
                      <span className="text-white">
                        {exam.duration} minutes
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Marks & Grading
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Full Marks:{" "}
                      <span className="text-white">{exam.fullMarks}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Pass Marks:{" "}
                      <span className="text-white">{exam.passMarks || 0}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Grading:{" "}
                      <span className="text-white">{exam.gradingType}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Total Students</p>
                  <p className="text-xl font-bold text-white">
                    {exam.totalStudents}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Appeared</p>
                  <p className="text-xl font-bold text-white">
                    {exam.appearedCount}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Passed</p>
                  <p className="text-xl font-bold text-white">
                    {exam.passedCount}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Pass Rate</p>
                  <p className="text-xl font-bold text-purple-400">
                    {exam.totalStudents > 0
                      ? Math.round(
                          (exam.passedCount / exam.totalStudents) * 100,
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {/* Instructions */}
              {exam.instructions && (
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Instructions</h4>
                  <p className="text-gray-400 whitespace-pre-wrap">
                    {exam.instructions}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Results Tab */
            <div className="space-y-4">
              {/* Results Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Total Students</p>
                  <p className="text-lg font-bold text-white">
                    {exam.totalStudents}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Appeared</p>
                  <p className="text-lg font-bold text-white">
                    {exam.appearedCount}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Passed</p>
                  <p className="text-lg font-bold text-white">
                    {exam.passedCount}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Average</p>
                  <p className="text-lg font-bold text-purple-400">
                    {exam.averageMarks.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-sm font-medium text-gray-400">
                        Rank
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-400">
                        Student
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-400">
                        Marks
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-400">
                        Percentage
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-400">
                        Grade
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-400"
                        >
                          No results available
                        </td>
                      </tr>
                    ) : (
                      results.map((result, index) => (
                        <tr key={result.id} className="border-b border-white/5">
                          <td className="p-3 text-white">
                            #{result.rank || index + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {result.student?.name?.charAt(0) || "S"}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {result.student?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Class: {result.student?.class || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-white">
                              {result.obtainedMarks}/{result.totalMarks}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-white">
                              {result.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-white">
                              {result.grade || "N/A"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                result.percentage >= (exam.passMarks || 40)
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {result.percentage >= (exam.passMarks || 40)
                                ? "Pass"
                                : "Fail"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* View All Results Button */}
              {results.length > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={onViewResults}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                  >
                    View Detailed Results
                  </button>
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
            {activeTab === "overview" && results.length > 0 && (
              <button
                onClick={() => setActiveTab("results")}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                View Results
              </button>
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
  exam: Exam;
  results: ExamResult[];
  onClose: () => void;
  onSaveResults: (results: any[]) => void;
  isLoading?: boolean;
}

const ResultsModal = ({
  exam,
  results,
  onClose,
  onSaveResults,
  isLoading,
}: ResultsModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedResults, setEditedResults] = useState<any[]>([]);

  useEffect(() => {
    setEditedResults(
      results.map((r) => ({
        studentId: r.studentId,
        obtainedMarks: r.obtainedMarks,
        grade: r.grade || "",
        feedback: r.feedback || "",
      })),
    );
  }, [results]);

  const handleMarksChange = (index: number, marks: number) => {
    const updated = [...editedResults];
    updated[index].obtainedMarks = marks;
    setEditedResults(updated);
  };

  const handleGradeChange = (index: number, grade: string) => {
    const updated = [...editedResults];
    updated[index].grade = grade;
    setEditedResults(updated);
  };

  const handleSave = () => {
    onSaveResults(editedResults);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Exam Results - {exam.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Header Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-500/10 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">
                {exam.totalStudents}
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg text-center">
              <p className="text-sm text-gray-400">Appeared</p>
              <p className="text-2xl font-bold text-white">
                {exam.appearedCount}
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
              <p className="text-sm text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-white">
                {exam.passedCount}
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg text-center">
              <p className="text-sm text-gray-400">Average</p>
              <p className="text-2xl font-bold text-purple-400">
                {exam.averageMarks.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mb-4">
            {!exam.isResultPublished && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editMode ? "Cancel Edit" : "Edit Results"}
              </button>
            )}
            {editMode && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-sm font-medium text-gray-400">
                    Rank
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">
                    Student
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">
                    Marks
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">
                    Percentage
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">
                    Grade
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No results available
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => (
                    <tr key={result.id} className="border-b border-white/5">
                      <td className="p-3 text-white">
                        #{result.rank || index + 1}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {result.student?.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {result.student?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Class: {result.student?.class || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {editMode ? (
                          <input
                            type="number"
                            value={editedResults[index]?.obtainedMarks || 0}
                            onChange={(e) =>
                              handleMarksChange(index, parseInt(e.target.value))
                            }
                            min="0"
                            max={exam.fullMarks}
                            className="w-20 px-2 py-1 bg-gray-700 border border-white/10 rounded text-white"
                          />
                        ) : (
                          <span className="text-white">
                            {result.obtainedMarks}/{result.totalMarks}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-white">
                          {result.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">
                        {editMode ? (
                          <input
                            type="text"
                            value={editedResults[index]?.grade || ""}
                            onChange={(e) =>
                              handleGradeChange(index, e.target.value)
                            }
                            className="w-16 px-2 py-1 bg-gray-700 border border-white/10 rounded text-white"
                            placeholder="A+"
                          />
                        ) : (
                          <span className="text-white">
                            {result.grade || "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            result.percentage >= (exam.passMarks || 40)
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {result.percentage >= (exam.passMarks || 40)
                            ? "Pass"
                            : "Fail"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    action: "publish" | "archive" | "delete" | "publishResults",
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
    "publish" | "archive" | "delete" | "publishResults"
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
            {selectedCount === 1 ? "Exam" : "Exams"}
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
              <option value="archive">Archive</option>
              <option value="publishResults">Publish Results</option>
              <option value="delete">Delete</option>
            </select>
          </div>

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
