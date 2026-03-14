// src/app/dashboard/admin/enrollments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  BarChart,
  TrendingUp,
  AlertCircle,
  UserCheck,
  UserX,
  CreditCard,
  FileText,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  BookOpen,
  GraduationCap,
  Award,
  Activity,
  X,
} from "lucide-react";

import {
  useGetEnrollmentsQuery,
  useGetEnrollmentQuery,
  useGetEnrollmentStatsQuery,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useUpdateEnrollmentStatusMutation,
  useBulkEnrollmentActionMutation,
  useGetInstallmentsQuery,
  useCreateInstallmentsMutation,
  useGetEnrollmentProgressQuery,
  useUpdateEnrollmentProgressMutation,
} from "@/store/api/enrollmentApi";

// Types
interface Enrollment {
  id: string;
  studentId: string;
  batchId: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "WAITLISTED"
    | "CANCELLED"
    | "COMPLETED"
    | "DROPPED";
  paymentStatus:
    | "PENDING"
    | "PARTIAL"
    | "COMPLETED"
    | "OVERDUE"
    | "REFUNDED"
    | "FAILED"
    | "PROCESSING";
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  appliedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  completedAt?: string | null;
  droppedAt?: string | null;
  progressPercentage: number;
  classesAttended: number;
  totalClasses: number;
  assignmentsDone: number;
  averageScore: number;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    email: string;
    phone: string;
    class?: string | null;
  };
  batch?: {
    id: string;
    name: string;
    subject: string;
    mode: string;
    price: number;
  };
}

interface Filters {
  search: string;
  status: string;
  paymentStatus: string;
  batchId: string;
  fromDate: string;
  toDate: string;
}

interface Student {
  id: string;
  name: string;
  profileImage: string | null;
  class: string | null;
  institute: string | null;
}

interface BatchTeacher {
  name: string;
  qualification: string | null;
}

interface BatchCourse {
  title: string;
  subject: string;
}

interface Batch {
  id: string;
  name: string;
  subject: string;
  mode: string;
  price: number;
  teacher?: BatchTeacher;
  course?: BatchCourse;
  currentEnrollments: number;
  maxStudents: number | null;
  startDate: string;
  endDate: string | null;
}

interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  paidDate: string | null;
  paymentId: string | null;
}

interface InstallmentPlan {
  total: number;
  frequency: string;
  totalAmount: number;
}

interface Metadata {
  enrolledBy: string;
  forceEnroll: boolean;
  enrolledByRole: string;
}

interface EnrollmentData {
  id: string;
  studentId: string;
  batchId: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "WAITLISTED"
    | "CANCELLED"
    | "COMPLETED"
    | "DROPPED";
  appliedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  completedAt: string | null;
  droppedAt: string | null;
  droppedReason: string | null;
  paymentStatus:
    | "PENDING"
    | "PARTIAL"
    | "COMPLETED"
    | "OVERDUE"
    | "REFUNDED"
    | "FAILED"
    | "PROCESSING";
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  couponCode: string | null;
  discountAmount: number;
  scholarshipAmount: number;
  scholarshipReason: string | null;
  installmentPlan: InstallmentPlan | null;
  progressPercentage: number;
  classesAttended: number;
  totalClasses: number;
  assignmentsDone: number;
  averageScore: number;
  metadata: Metadata | null;
  createdAt: string;
  updatedAt: string;
  student: Student;
  batch: Batch & {
    teacher?: BatchTeacher;
    course?: BatchCourse;
  };
  payments: any[];
  installments: Installment[];
}

const EnrollmentManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [installmentsModal, setInstallmentsModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    paymentStatus: "",
    batchId: "",
    fromDate: "",
    toDate: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: enrollmentsData,
    isLoading,
    error,
    refetch,
  } = useGetEnrollmentsQuery({
    page,
    limit,
    search: filters.search || undefined,
    status: filters.status || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    batchId: filters.batchId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetEnrollmentStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleEnrollment, refetch: refetchEnrollment } =
    useGetEnrollmentQuery(selectedEnrollment?.id || "", {
      skip: !selectedEnrollment?.id,
    });

  const { data: installments } = useGetInstallmentsQuery(
    selectedEnrollment?.id || "",
    { skip: !selectedEnrollment?.id },
  );

  const { data: progress } = useGetEnrollmentProgressQuery(
    selectedEnrollment?.id || "",
    { skip: !selectedEnrollment?.id },
  );

  const enrollments = enrollmentsData?.data || [];
  const meta = enrollmentsData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [updateEnrollment, { isLoading: isUpdating }] =
    useUpdateEnrollmentMutation();
  const [deleteEnrollment, { isLoading: isDeleting }] =
    useDeleteEnrollmentMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateEnrollmentStatusMutation();
  const [bulkAction, { isLoading: isBulkAction }] =
    useBulkEnrollmentActionMutation();
  const [createInstallments, { isLoading: isCreatingInstallments }] =
    useCreateInstallmentsMutation();
  const [updateProgress, { isLoading: isUpdatingProgress }] =
    useUpdateEnrollmentProgressMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singleEnrollment && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singleEnrollment, viewModal]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (enrollment: Enrollment) => {
    const result = await Swal.fire({
      title: "Delete Enrollment?",
      text: `Are you sure you want to delete this enrollment? This action cannot be undone.`,
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
        await deleteEnrollment(enrollment.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Enrollment has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedEnrollment?.id === enrollment.id) {
          setSelectedEnrollment(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete enrollment",
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
    reason?: string,
  ) => {
    try {
      await updateStatus({ id, status, reason }).unwrap();
      Swal.fire({
        title: "Success!",
        text: `Enrollment status updated to ${status}`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetch();
      refetchStats();
      if (selectedEnrollment?.id === id) {
        refetchEnrollment();
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

  const handleBulkAction = async (action: string, reason?: string) => {
    if (!selectedEnrollments.length) {
      Swal.fire({
        title: "No enrollments selected",
        text: "Please select at least one enrollment",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedEnrollments.length} enrollments?`,
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
          enrollmentIds: selectedEnrollments,
          action,
          reason,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedEnrollments.length} enrollments ${action}d successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedEnrollments([]);
        setSelectAll(false);
        refetch();
        refetchStats();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} enrollments`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleUpdateEnrollment = async (id: string, data: any) => {
    try {
      await updateEnrollment({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Enrollment updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedEnrollment(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update enrollment",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleCreateInstallments = async (data: any) => {
    if (!selectedEnrollment) return;
    try {
      await createInstallments({
        id: selectedEnrollment.id,
        data,
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Installment plan created successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setInstallmentsModal(false);
      refetchEnrollment();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to create installments",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdateProgress = async (id: string, data: any) => {
    try {
      await updateProgress({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Progress updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setProgressModal(false);
      refetch();
      refetchEnrollment();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update progress",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSelect = (id: string) => {
    if (selectedEnrollments.includes(id)) {
      setSelectedEnrollments(selectedEnrollments.filter((s) => s !== id));
    } else {
      setSelectedEnrollments([...selectedEnrollments, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEnrollments([]);
    } else {
      setSelectedEnrollments(enrollments.map((e: Enrollment) => e.id));
    }
    setSelectAll(!selectAll);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentStatus: "",
      batchId: "",
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "REJECTED":
      case "CANCELLED":
      case "DROPPED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "WAITLISTED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400";
      case "PARTIAL":
        return "bg-blue-500/20 text-blue-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "OVERDUE":
        return "bg-orange-500/20 text-orange-400";
      case "FAILED":
      case "REFUNDED":
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
          <Users className="w-8 h-8 text-blue-400" />
          Enrollment Management
        </h1>
        <p className="text-gray-400">
          Manage all student enrollments across batches
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Enrollments</h3>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Pending</h3>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.byStatus?.find((s: any) => s.status === "PENDING")
                ?._count || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Approved</h3>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.byStatus?.find((s: any) => s.status === "APPROVED")
                ?._count || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              ₹{stats.data?.revenue?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setBulkActionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              disabled={selectedEnrollments.length === 0}
            >
              <Users className="w-4 h-4" />
              Bulk Actions ({selectedEnrollments.length})
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
              placeholder="Search by student name or email..."
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
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DROPPED">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => {
                    setFilters({ ...filters, paymentStatus: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Batch ID
                </label>
                <input
                  type="text"
                  value={filters.batchId}
                  onChange={(e) => {
                    setFilters({ ...filters, batchId: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="Batch ID"
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
      {selectedEnrollments.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedEnrollments.length}</span>{" "}
            enrollments selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("approve")}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              Approve
            </button>
            <button
              onClick={() => handleBulkAction("reject")}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Reject
            </button>
            <button
              onClick={() => handleBulkAction("complete")}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Complete
            </button>
          </div>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load enrollments</p>
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
                        checked={selectAll && enrollments.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Student
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Batch
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Payment
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Fees
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Progress
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Applied
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment: Enrollment) => (
                    <tr
                      key={enrollment.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(enrollment)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedEnrollments.includes(enrollment.id)}
                          onChange={() => handleSelect(enrollment.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {enrollment.student?.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {enrollment.student?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enrollment.student?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">
                          {enrollment.batch?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {enrollment.batch?.subject}
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            enrollment.status,
                          )}`}
                        >
                          {enrollment.status === "APPROVED" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {enrollment.status === "PENDING" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {enrollment.status === "REJECTED" && (
                            <XCircle className="w-3 h-3" />
                          )}
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            enrollment.paymentStatus,
                          )}`}
                        >
                          {enrollment.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          ₹{enrollment.paidAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          of ₹{enrollment.totalFees.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-400"
                              style={{
                                width: `${enrollment.progressPercentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {enrollment.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {formatDate(enrollment.appliedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnrollment(enrollment);
                              setProgressModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Progress"
                          >
                            <Activity className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnrollment(enrollment);
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
                              handleDelete(enrollment);
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
                  enrollments
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

      {/* View Enrollment Modal */}
      {viewModal && selectedEnrollment && (
        <ViewEnrollmentModal
          enrollment={singleEnrollment}
          installments={installments?.data || []}
          progress={progress}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedEnrollment(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onUpdateStatus={handleUpdateStatus}
          onShowInstallments={() => {
            setViewModal(false);
            setInstallmentsModal(true);
          }}
        />
      )}

      {/* Edit Enrollment Modal */}
      {editModal && selectedEnrollment && (
        <EditEnrollmentModal
          enrollment={selectedEnrollment}
          onClose={() => {
            setEditModal(false);
            setSelectedEnrollment(null);
          }}
          onSubmit={(data) =>
            handleUpdateEnrollment(selectedEnrollment.id, data)
          }
          isLoading={isUpdating}
        />
      )}

      {/* Progress Modal */}
      {progressModal && selectedEnrollment && (
        <ProgressModal
          enrollment={selectedEnrollment}
          progress={progress}
          onClose={() => {
            setProgressModal(false);
            setSelectedEnrollment(null);
          }}
          onSubmit={(data) => handleUpdateProgress(selectedEnrollment.id, data)}
          isLoading={isUpdatingProgress}
        />
      )}

      {/* Installments Modal */}
      {installmentsModal && selectedEnrollment && (
        <InstallmentsModal
          enrollment={selectedEnrollment}
          installments={installments?.data || []}
          onClose={() => {
            setInstallmentsModal(false);
            setSelectedEnrollment(null);
          }}
          onCreatePlan={handleCreateInstallments}
          isLoading={isCreatingInstallments}
        />
      )}

      {/* Bulk Action Modal */}
      {bulkActionModal && (
        <BulkActionModal
          selectedCount={selectedEnrollments.length}
          onClose={() => setBulkActionModal(false)}
          onAction={handleBulkAction}
          isLoading={isBulkAction}
        />
      )}
    </div>
  );
};

export default EnrollmentManagement;

// =============================================
// VIEW ENROLLMENT MODAL
// =============================================

// =============================================
// VIEW ENROLLMENT MODAL (UPDATED with correct progress data)
// =============================================

interface ViewEnrollmentModalProps {
  enrollment?: EnrollmentData;
  installments?: Installment[];
  progress?: any;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdateStatus: (id: string, status: string, reason?: string) => void;
  onShowInstallments: () => void;
}

const ViewEnrollmentModal = ({
  enrollment,
  installments = [],
  progress,
  isLoading = false,
  onClose,
  onEdit,
  onUpdateStatus,
  onShowInstallments,
}: ViewEnrollmentModalProps) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Ensure installments is an array
  const installmentsArray = Array.isArray(installments) ? installments : [];

  console.log(enrollment);

  // Calculate pending installments
  const pendingInstallments = installmentsArray.filter(
    (inst) => inst.status === "PENDING",
  ).length;

  // Extract progress data safely
  const progressData = progress?.data || progress;
  const metrics = progressData?.metrics || {
    attendance: { total: 0, present: 0, percentage: 0, history: [] },
    quizzes: { total: 0, averageScore: 0, results: [] },
    exams: { total: 0, averageScore: 0, results: [] },
  };
  const summary = progressData?.summary || {
    attendancePercentage: 0,
    quizAverage: 0,
    examAverage: 0,
    overallProgress: enrollment?.progressPercentage || 0,
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (status: string) => {
    if (status === "REJECTED") {
      setShowRejectInput(true);
    } else {
      onUpdateStatus(enrollment?.id || "", status);
      setShowStatusMenu(false);
    }
  };

  const handleReject = () => {
    if (rejectReason.trim() && enrollment) {
      onUpdateStatus(enrollment.id, "REJECTED", rejectReason);
      setShowRejectInput(false);
      setRejectReason("");
      setShowStatusMenu(false);
    }
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 border border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 border border-yellow-500/30";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-500/20 border border-red-500/30";
      case "DROPPED":
        return "bg-orange-500/20 border border-orange-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 border border-blue-500/30";
      case "WAITLISTED":
        return "bg-purple-500/20 border border-purple-500/30";
      default:
        return "bg-gray-500/20 border border-gray-500/30";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "PENDING":
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case "REJECTED":
      case "CANCELLED":
        return <XCircle className="w-6 h-6 text-red-400" />;
      case "DROPPED":
        return <UserX className="w-6 h-6 text-orange-400" />;
      case "COMPLETED":
        return <Award className="w-6 h-6 text-blue-400" />;
      default:
        return <Users className="w-6 h-6 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white text-lg">Loading enrollment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white text-lg">Enrollment not found</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
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
            <Users className="w-5 h-5 text-blue-400" />
            Enrollment Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Status Banner */}
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between ${getStatusColor(
              enrollment.status,
            )}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(enrollment.status)}
              <div>
                <p className="text-white font-medium">
                  Status: {enrollment.status}
                </p>
                {enrollment.rejectedReason && (
                  <p className="text-sm text-red-400">
                    Reason: {enrollment.rejectedReason}
                  </p>
                )}
                {enrollment.droppedReason && (
                  <p className="text-sm text-orange-400">
                    Reason: {enrollment.droppedReason}
                  </p>
                )}
                {enrollment.metadata && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enrolled by: {enrollment.metadata.enrolledByRole} •{" "}
                    {formatDateTime(enrollment.createdAt)}
                  </p>
                )}
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                Update Status
                <ChevronDown className="w-4 h-4" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleStatusChange("APPROVED")}
                      className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-white/5"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange("COMPLETED")}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-white/5"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange("REJECTED")}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange("DROPPED")}
                      className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-white/5"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showRejectInput && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white mb-3"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}

          {/* Student & Batch Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Student Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {enrollment.student?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {enrollment.student?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      ID: {enrollment.student?.id}
                    </p>
                  </div>
                </div>
                <div className="pt-2 space-y-1">
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Class:</span>{" "}
                    {enrollment.student?.class || "N/A"}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Institute:</span>{" "}
                    {enrollment.student?.institute || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Batch Information
              </h3>
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {enrollment.batch?.name}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-500">Subject:</span>{" "}
                  {enrollment.batch?.subject}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-500">Mode:</span>{" "}
                  {enrollment.batch?.mode}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-500">Price:</span> ₹
                  {enrollment.batch?.price?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-500">Enrollments:</span>{" "}
                  {enrollment.batch?.currentEnrollments || 0} /{" "}
                  {enrollment.batch?.maxStudents || "∞"}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-500">Duration:</span>{" "}
                  {formatDate(enrollment.batch?.startDate)} -{" "}
                  {formatDate(enrollment.batch?.endDate) || "Ongoing"}
                </p>
                {enrollment.batch?.teacher && (
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Teacher:</span>{" "}
                    {enrollment.batch.teacher.name}
                    {enrollment.batch.teacher.qualification &&
                      ` (${enrollment.batch.teacher.qualification})`}
                  </p>
                )}
                {enrollment.batch?.course && (
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Course:</span>{" "}
                    {enrollment.batch.course.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Total Fees</p>
              <p className="text-2xl font-bold text-white">
                ₹{enrollment.totalFees?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{enrollment.paidAmount?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((enrollment.paidAmount / enrollment.totalFees) * 100).toFixed(
                  1,
                )}
                % paid
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Due Amount</p>
              <p className="text-2xl font-bold text-red-400">
                ₹{enrollment.dueAmount?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Payment Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  enrollment.paymentStatus === "COMPLETED"
                    ? "bg-green-500/20 text-green-400"
                    : enrollment.paymentStatus === "PARTIAL"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : enrollment.paymentStatus === "PENDING"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400"
                }`}
              >
                {enrollment.paymentStatus}
              </span>
            </div>
          </div>

          {/* Installment Plan Summary */}
          {enrollment.installmentPlan && (
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Installment Plan Details
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Total Installments</p>
                  <p className="text-lg font-bold text-white">
                    {enrollment.installmentPlan.total}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Frequency</p>
                  <p className="text-lg font-bold text-white capitalize">
                    {enrollment.installmentPlan.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Amount</p>
                  <p className="text-lg font-bold text-white">
                    ₹{enrollment.installmentPlan.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pending</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {pendingInstallments}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Info - Updated with correct data structure */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">Progress</p>
              <p className="text-xl font-bold text-white">
                {enrollment.progressPercentage}%
              </p>
              <div className="w-full h-1 bg-gray-700 rounded-full mt-2">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${enrollment.progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">Attendance</p>
              <p className="text-xl font-bold text-white">
                {metrics.attendance.present}/{metrics.attendance.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.attendance.percentage}%
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">Quizzes</p>
              <p className="text-xl font-bold text-white">
                {metrics.quizzes.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {metrics.quizzes.averageScore.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">Exams</p>
              <p className="text-xl font-bold text-white">
                {metrics.exams.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {metrics.exams.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <p className="text-xs text-gray-400">Attendance Rate</p>
              <p className="text-xl font-bold text-blue-400">
                {summary.attendancePercentage}%
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-xs text-gray-400">Quiz Average</p>
              <p className="text-xl font-bold text-green-400">
                {summary.quizAverage.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-center">
              <p className="text-xs text-gray-400">Exam Average</p>
              <p className="text-xl font-bold text-purple-400">
                {summary.examAverage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Discount & Scholarship Info */}
          {(enrollment.discountAmount > 0 ||
            enrollment.scholarshipAmount > 0) && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                Discounts & Scholarships
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {enrollment.discountAmount > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">Discount Amount</p>
                    <p className="text-white font-medium">
                      ₹{enrollment.discountAmount.toLocaleString()}
                    </p>
                    {enrollment.couponCode && (
                      <p className="text-xs text-gray-500">
                        Coupon: {enrollment.couponCode}
                      </p>
                    )}
                  </div>
                )}
                {enrollment.scholarshipAmount > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">Scholarship Amount</p>
                    <p className="text-white font-medium">
                      ₹{enrollment.scholarshipAmount.toLocaleString()}
                    </p>
                    {enrollment.scholarshipReason && (
                      <p className="text-xs text-gray-500">
                        Reason: {enrollment.scholarshipReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Applied:</span>
                  <span className="text-white">
                    {formatDateTime(enrollment.appliedAt)}
                  </span>
                </div>
                {enrollment.approvedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Approved:</span>
                    <span className="text-white">
                      {formatDateTime(enrollment.approvedAt)}
                    </span>
                  </div>
                )}
                {enrollment.completedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">
                      {formatDateTime(enrollment.completedAt)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {enrollment.rejectedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-gray-400">Rejected:</span>
                    <span className="text-white">
                      {formatDateTime(enrollment.rejectedAt)}
                    </span>
                  </div>
                )}
                {enrollment.droppedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <UserX className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-400">Dropped:</span>
                    <span className="text-white">
                      {formatDateTime(enrollment.droppedAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">
                    {formatDateTime(enrollment.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Installments Preview */}
          {installmentsArray.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Installments</h3>
                <button
                  onClick={onShowInstallments}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All ({installmentsArray.length})
                </button>
              </div>
              <div className="space-y-2">
                {installmentsArray.slice(0, 3).map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        ₹{inst.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {formatDate(inst.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          inst.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {inst.status}
                      </span>
                      {inst.paidDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Paid: {formatDate(inst.paidDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
            >
              Close
            </button>
            <button
              onClick={onShowInstallments}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Manage Installments
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit Enrollment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// EDIT ENROLLMENT MODAL
// =============================================

interface EditEnrollmentModalProps {
  enrollment: Enrollment;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const EditEnrollmentModal = ({
  enrollment,
  onClose,
  onSubmit,
  isLoading,
}: EditEnrollmentModalProps) => {
  const [form, setForm] = useState({
    status: enrollment.status,
    paymentStatus: enrollment.paymentStatus,
    totalFees: enrollment.totalFees,
    paidAmount: enrollment.paidAmount,
    dueAmount: enrollment.dueAmount,
    progressPercentage: enrollment.progressPercentage,
    classesAttended: enrollment.classesAttended,
    totalClasses: enrollment.totalClasses,
    assignmentsDone: enrollment.assignmentsDone,
    averageScore: enrollment.averageScore,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert string values to numbers before submitting
    const submitData = {
      ...form,
      totalFees: parseFloat(form.totalFees.toString()) || 0,
      paidAmount: parseFloat(form.paidAmount.toString()) || 0,
      dueAmount: parseFloat(form.dueAmount.toString()) || 0,
      progressPercentage: parseInt(form.progressPercentage.toString()) || 0,
      classesAttended: parseInt(form.classesAttended.toString()) || 0,
      totalClasses: parseInt(form.totalClasses.toString()) || 0,
      assignmentsDone: parseInt(form.assignmentsDone.toString()) || 0,
      averageScore: parseFloat(form.averageScore.toString()) || 0,
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Enrollment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Fees
              </label>
              <input
                type="number"
                name="totalFees"
                value={form.totalFees}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paid Amount
              </label>
              <input
                type="number"
                name="paidAmount"
                value={form.paidAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Amount
              </label>
              <input
                type="number"
                name="dueAmount"
                value={form.dueAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Progress %
              </label>
              <input
                type="number"
                name="progressPercentage"
                value={form.progressPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Average Score
              </label>
              <input
                type="number"
                name="averageScore"
                value={form.averageScore}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Classes Attended
              </label>
              <input
                type="number"
                name="classesAttended"
                value={form.classesAttended}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Classes
              </label>
              <input
                type="number"
                name="totalClasses"
                value={form.totalClasses}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assignments Done
              </label>
              <input
                type="number"
                name="assignmentsDone"
                value={form.assignmentsDone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
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
              {isLoading ? "Saving..." : "Update Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// PROGRESS MODAL
// =============================================

interface ProgressModalProps {
  enrollment: Enrollment;
  progress?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const ProgressModal = ({
  enrollment,
  progress,
  onClose,
  onSubmit,
  isLoading,
}: ProgressModalProps) => {
  const [form, setForm] = useState({
    progressPercentage: enrollment.progressPercentage,
    classesAttended: enrollment.classesAttended,
    totalClasses: enrollment.totalClasses,
    assignmentsDone: enrollment.assignmentsDone,
    averageScore: enrollment.averageScore,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: parseInt(value) || 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Update Progress - {enrollment.student?.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {progress && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-400">Attendance</p>
                <p className="text-xl font-bold text-white">
                  {progress.data?.metrics?.attendance?.percentage || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Quiz Average</p>
                <p className="text-xl font-bold text-white">
                  {progress.data?.summary?.quizAverage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Progress Percentage
            </label>
            <input
              type="range"
              name="progressPercentage"
              value={form.progressPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {form.progressPercentage}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Classes Attended
              </label>
              <input
                type="number"
                name="classesAttended"
                value={form.classesAttended}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Classes
              </label>
              <input
                type="number"
                name="totalClasses"
                value={form.totalClasses}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assignments Done
              </label>
              <input
                type="number"
                name="assignmentsDone"
                value={form.assignmentsDone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Average Score
              </label>
              <input
                type="number"
                name="averageScore"
                value={form.averageScore}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
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
              {isLoading ? "Saving..." : "Update Progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// INSTALLMENTS MODAL
// =============================================

interface InstallmentsModalProps {
  enrollment: Enrollment;
  installments: any[]; // Array of installments
  onClose: () => void;
  onCreatePlan: (data: any) => void;
  isLoading?: boolean;
}

const InstallmentsModal = ({
  enrollment,
  installments = [],
  onClose,
  onCreatePlan,
  isLoading,
}: InstallmentsModalProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [plan, setPlan] = useState({
    totalInstallments: 3,
    frequency: "monthly",
    generatedInstallments: [] as any[],
  });

  // Ensure installments is an array
  const installmentsArray = Array.isArray(installments) ? installments : [];

  const generateInstallments = () => {
    const amount = Math.round(enrollment.totalFees / plan.totalInstallments);
    const generated = [];
    const today = new Date();

    for (let i = 0; i < plan.totalInstallments; i++) {
      const dueDate = new Date(today);
      if (plan.frequency === "monthly") {
        dueDate.setMonth(today.getMonth() + i + 1);
      } else if (plan.frequency === "weekly") {
        dueDate.setDate(today.getDate() + (i + 1) * 7);
      } else if (plan.frequency === "biweekly") {
        dueDate.setDate(today.getDate() + (i + 1) * 14);
      }

      generated.push({
        amount,
        dueDate: dueDate.toISOString().split("T")[0],
      });
    }

    setPlan({ ...plan, generatedInstallments: generated });
  };

  const handleCreatePlan = () => {
    onCreatePlan({
      installments: plan.generatedInstallments,
      frequency: plan.frequency,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Installment Plan - {enrollment.student?.name || "Student"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {installmentsArray.length === 0 ? (
            <>
              <div className="text-center py-8 mb-4">
                <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No installment plan created yet</p>
              </div>

              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Create Installment Plan
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Number of Installments
                      </label>
                      <input
                        type="number"
                        value={plan.totalInstallments}
                        onChange={(e) =>
                          setPlan({
                            ...plan,
                            totalInstallments: parseInt(e.target.value) || 1,
                          })
                        }
                        min="1"
                        max="12"
                        className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frequency
                      </label>
                      <select
                        value={plan.frequency}
                        onChange={(e) =>
                          setPlan({ ...plan, frequency: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={generateInstallments}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Generate Installments
                  </button>

                  {plan.generatedInstallments.length > 0 && (
                    <>
                      <div className="mt-4 space-y-2">
                        {plan.generatedInstallments.map((inst, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                Installment {index + 1}
                              </p>
                              <p className="text-xs text-gray-500">
                                Due: {formatDate(inst.dueDate)}
                              </p>
                            </div>
                            <p className="text-white font-medium">
                              ₹{inst.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreatePlan}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isLoading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {isLoading ? "Creating..." : "Create Plan"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  Total Amount: ₹{enrollment.totalFees.toLocaleString()} •{" "}
                  {installmentsArray.length} Installment
                  {installmentsArray.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {installmentsArray.map((inst: any, index: number) => (
                  <div
                    key={inst.id || index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">
                        Installment {index + 1}
                      </p>
                      <p className="text-sm text-gray-400">
                        Due: {formatDate(inst.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        ₹{inst.amount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                          inst.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-400"
                            : inst.status === "PENDING"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {inst.status || "PENDING"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add More Installments
                </button>
              </div>
            </div>
          )}
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
  onAction: (action: string, reason?: string) => void;
  isLoading?: boolean;
}

const BulkActionModal = ({
  selectedCount,
  onClose,
  onAction,
  isLoading,
}: BulkActionModalProps) => {
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(action, reason || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Bulk Action - {selectedCount} Enrollments
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="complete">Complete</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {(action === "reject" || action === "delete") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="Enter reason..."
              />
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
