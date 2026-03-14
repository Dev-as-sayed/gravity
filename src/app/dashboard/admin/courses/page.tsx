// src/app/dashboard/admin/batches/page.tsx
"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  BookOpen,
  Layers,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  DollarSign,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Settings,
  Star,
  Activity,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Video,
  Globe,
  Home,
  Link2,
  FileText,
  Download,
  Upload,
  Play,
  Pause,
  PlayCircle,
  BarChart,
  TrendingUp,
} from "lucide-react";

import {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useToggleBatchStatusMutation,
  useGetBatchStatsQuery,
  useGetBatchEnrollmentsQuery,
  useGetBatchMaterialsQuery,
  useAddBatchMaterialMutation,
  useDeleteBatchMaterialMutation,
  useGetBatchReviewsQuery,
  useAddBatchReviewMutation,
  useEnrollInBatchMutation,
} from "@/store/api/batchApi";

// Types
interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  subject: string;
  category: string;
  thumbnail?: string | null;
  teacherId: string;
  duration?: number | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  price: number;
  offerPrice?: number | null;
  isFree: boolean;
  totalBatches: number;
  totalStudents: number;
  averageRating: number;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
  };
  _count?: {
    batches: number;
  };
}

interface Batch {
  id: string;
  name: string;
  slug: string;
  courseId: string;
  teacherId: string;
  subject: string;
  description?: string | null;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  language?: string | null;
  maxStudents?: number | null;
  currentEnrollments: number;
  startDate: string;
  endDate?: string | null;
  price: number;
  offerPrice?: number | null;
  isActive: boolean;
  isPublished: boolean;
  enrollmentOpen: boolean;
  visibility: "PUBLIC" | "PRIVATE" | "LINK_ONLY";
  topics: string[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
    profileImage?: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
  _count?: {
    enrollments: number;
    materials: number;
  };
}

interface BatchMaterial {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  isFree: boolean;
  uploadedAt: string;
  downloads: number;
  views: number;
}

interface Enrollment {
  id: string;
  studentId: string;
  status: string;
  appliedAt: string;
  paymentStatus: string;
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    email: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  pros: string[];
  cons: string[];
  isAnonymous: boolean;
  createdAt: string;
  student?: {
    name: string;
    profileImage?: string | null;
  };
}

type TabType = "courses" | "batches";

const BatchManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("batches");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    mode: "",
    isActive: "",
    enrollmentOpen: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  // Courses query
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useGetCoursesQuery({
    page,
    limit,
    search: search || undefined,
  });

  // Batches query
  const {
    data: batchesData,
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useGetBatchesQuery({
    page,
    limit,
    search: search || undefined,
    subject: filters.subject || undefined,
    mode: filters.mode || undefined,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    enrollmentOpen: filters.enrollmentOpen
      ? filters.enrollmentOpen === "true"
      : undefined,
  });

  // Statistics
  const { data: stats, refetch: refetchStats } = useGetBatchStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  // Single batch data
  const { data: singleBatchData, refetch: refetchBatch } = useGetBatchByIdQuery(
    selectedBatch?.id || "",
    { skip: !selectedBatch?.id },
  );

  // Batch enrollments
  const { data: enrollments, refetch: refetchEnrollments } =
    useGetBatchEnrollmentsQuery(selectedBatch?.id || "", {
      skip: !selectedBatch?.id,
    });

  // Batch materials
  const { data: materials, refetch: refetchMaterials } =
    useGetBatchMaterialsQuery(selectedBatch?.id || "", {
      skip: !selectedBatch?.id,
    });

  // Batch reviews
  const { data: reviewsData, refetch: refetchReviews } =
    useGetBatchReviewsQuery(selectedBatch?.id || "", {
      skip: !selectedBatch?.id,
    });

  const courses = coursesData?.data || [];
  const batches = batchesData?.data || [];
  const meta = activeTab === "courses" ? coursesData?.meta : batchesData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [createCourse, { isLoading: isCreatingCourse }] =
    useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdatingCourse }] =
    useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeletingCourse }] =
    useDeleteCourseMutation();

  const [createBatch, { isLoading: isCreatingBatch }] =
    useCreateBatchMutation();
  const [updateBatch, { isLoading: isUpdatingBatch }] =
    useUpdateBatchMutation();
  const [deleteBatch, { isLoading: isDeletingBatch }] =
    useDeleteBatchMutation();
  const [toggleBatchStatus] = useToggleBatchStatusMutation();

  const [addMaterial, { isLoading: isAddingMaterial }] =
    useAddBatchMaterialMutation();
  const [deleteMaterial] = useDeleteBatchMaterialMutation();
  const [enrollInBatch] = useEnrollInBatchMutation();

  /* ===============================
  HANDLERS
  =============================== */

  const handleDeleteCourse = async (course: Course) => {
    if (course._count?.batches && course._count.batches > 0) {
      Swal.fire({
        title: "Cannot Delete",
        text: "This course has batches. Delete batches first.",
        icon: "warning",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete Course?",
      text: `Are you sure you want to delete ${course.title}?`,
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
        await deleteCourse(course.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Course deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete course",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleDeleteBatch = async (batch: Batch) => {
    if (batch._count?.enrollments && batch._count.enrollments > 0) {
      Swal.fire({
        title: "Cannot Delete",
        text: "This batch has enrollments. Cannot delete.",
        icon: "warning",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete Batch?",
      text: `Are you sure you want to delete ${batch.name}?`,
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
        await deleteBatch(batch.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Batch deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete batch",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleToggleStatus = async (batch: Batch) => {
    try {
      await toggleBatchStatus({
        id: batch.id,
        isActive: !batch.isActive,
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: `Batch ${batch.isActive ? "deactivated" : "activated"} successfully.`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
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

  const handleAddMaterial = async (data: any) => {
    if (!selectedBatch) return;
    try {
      await addMaterial({
        batchId: selectedBatch.id,
        data,
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Material added successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setShowMaterialModal(false);
      refetchMaterials();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to add material",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedBatch) return;
    const result = await Swal.fire({
      title: "Delete Material?",
      text: "Are you sure you want to delete this material?",
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
        await deleteMaterial({
          batchId: selectedBatch.id,
          materialId,
        }).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Material deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchMaterials();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete material",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedBatch) return;
    try {
      await enrollInBatch({
        batchId: selectedBatch.id,
        data: { autoApprove: true },
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Student enrolled successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetchEnrollments();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to enroll student",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      subject: "",
      mode: "",
      isActive: "",
      enrollmentOpen: "",
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

  // Get mode icon
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return <Video className="w-4 h-4" />;
      case "OFFLINE":
        return <Home className="w-4 h-4" />;
      case "HYBRID":
        return <Globe className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  // Get mode color
  const getModeColor = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "OFFLINE":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "HYBRID":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
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
          <Layers className="w-8 h-8 text-blue-400" />
          Batch & Course Management
        </h1>
        <p className="text-gray-400">
          Manage all courses and batches across the platform
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Batches</h3>
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Active Batches</h3>
              <PlayCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.active || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Enrollments</h3>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.enrollments || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Revenue</h3>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              ₹{stats.data?.revenue?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("batches")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "batches"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 inline-block mr-2" />
          Batches
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "courses"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4 inline-block mr-2" />
          Courses
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (activeTab === "courses") {
                  setSelectedCourse(null);
                  setShowCourseModal(true);
                } else {
                  setSelectedBatch(null);
                  setShowBatchModal(true);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === "courses" ? "Course" : "Batch"}
            </button>
            <button
              onClick={() => {
                if (activeTab === "courses") {
                  refetchCourses();
                } else {
                  refetchBatches();
                }
                refetchStats();
              }}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-gray-300 font-medium flex items-center gap-2 hover:bg-gray-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="flex gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {activeTab === "batches" && (
              <select
                value={filters.mode}
                onChange={(e) =>
                  setFilters({ ...filters, mode: e.target.value })
                }
                className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            )}
          </div>
        </div>

        {activeTab === "batches" && (
          <div className="mt-4 flex flex-wrap gap-3">
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value })
              }
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={filters.enrollmentOpen}
              onChange={(e) =>
                setFilters({ ...filters, enrollmentOpen: e.target.value })
              }
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Enrollment</option>
              <option value="true">Open</option>
              <option value="false">Closed</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {(activeTab === "courses" ? isLoadingCourses : isLoadingBatches) ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Name
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Teacher
                    </th>
                    {activeTab === "courses" ? (
                      <>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Subject
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Level
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Price
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Batches
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Mode
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Start Date
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Price
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Enrollments
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Status
                        </th>
                      </>
                    )}
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Rating
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "courses"
                    ? courses.map((course: Course) => (
                        <tr
                          key={course.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowViewModal(true);
                          }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {course.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {course.subject}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white text-sm">
                              {course.teacher?.name || "N/A"}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-white text-sm">
                              {course.subject}
                            </p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}
                            >
                              {course.level}
                            </span>
                          </td>
                          <td className="p-4">
                            {course.isFree ? (
                              <span className="text-green-400 text-sm font-medium">
                                Free
                              </span>
                            ) : (
                              <div>
                                <p className="text-white text-sm">
                                  ₹{course.price}
                                </p>
                                {course.offerPrice && (
                                  <p className="text-xs text-gray-500 line-through">
                                    ₹{course.offerPrice}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-purple-400" />
                              <span className="text-white text-sm">
                                {course._count?.batches || 0}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-white text-sm">
                                {course.averageRating.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCourse(course);
                                  setShowCourseModal(true);
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCourse(course);
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : batches.map((batch: Batch) => (
                        <tr
                          key={batch.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowViewModal(true);
                          }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {batch.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {batch.course?.title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white text-sm">
                              {batch.teacher?.name || "N/A"}
                            </p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor(batch.mode)}`}
                            >
                              {getModeIcon(batch.mode)}
                              {batch.mode}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-white text-sm">
                                {formatDate(batch.startDate)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-white text-sm">
                                ₹{batch.price}
                              </span>
                              {batch.offerPrice && (
                                <span className="text-xs text-gray-500 line-through ml-1">
                                  ₹{batch.offerPrice}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-white text-sm">
                                {batch.currentEnrollments}/
                                {batch.maxStudents || "∞"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  batch.isActive
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {batch.isActive ? "Active" : "Inactive"}
                              </span>
                              {batch.enrollmentOpen && batch.isActive && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 ml-2">
                                  Open
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-white text-sm">
                                {batch.averageRating.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBatch(batch);
                                  setShowBatchModal(true);
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(batch);
                                }}
                                className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${
                                  batch.isActive
                                    ? "text-yellow-400"
                                    : "text-green-400"
                                }`}
                                title={
                                  batch.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                {batch.isActive ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBatch(batch);
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-400"
                                title="Delete"
                                disabled={isDeletingBatch}
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
                  {activeTab}
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

      {/* Course Modal */}
      {showCourseModal && (
        <CourseModal
          mode={selectedCourse ? "edit" : "create"}
          course={selectedCourse}
          onClose={() => {
            setShowCourseModal(false);
            setSelectedCourse(null);
          }}
          onSubmit={async (data) => {
            try {
              if (selectedCourse) {
                await updateCourse({ id: selectedCourse.id, data }).unwrap();
              } else {
                await createCourse(data).unwrap();
              }
              Swal.fire({
                title: "Success!",
                text: `Course ${selectedCourse ? "updated" : "created"} successfully.`,
                icon: "success",
                background: "#1f2937",
                color: "#fff",
                timer: 2000,
              });
              setShowCourseModal(false);
              setSelectedCourse(null);
              refetchCourses();
            } catch (error: any) {
              Swal.fire({
                title: "Error!",
                text:
                  error.data?.message ||
                  `Failed to ${selectedCourse ? "update" : "create"} course`,
                icon: "error",
                background: "#1f2937",
                color: "#fff",
              });
            }
          }}
          isLoading={isCreatingCourse || isUpdatingCourse}
        />
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <BatchModal
          mode={selectedBatch ? "edit" : "create"}
          batch={selectedBatch}
          courses={courses}
          onClose={() => {
            setShowBatchModal(false);
            setSelectedBatch(null);
          }}
          onSubmit={async (data) => {
            try {
              if (selectedBatch) {
                await updateBatch({ id: selectedBatch.id, data }).unwrap();
              } else {
                await createBatch(data).unwrap();
              }
              Swal.fire({
                title: "Success!",
                text: `Batch ${selectedBatch ? "updated" : "created"} successfully.`,
                icon: "success",
                background: "#1f2937",
                color: "#fff",
                timer: 2000,
              });
              setShowBatchModal(false);
              setSelectedBatch(null);
              refetchBatches();
            } catch (error: any) {
              Swal.fire({
                title: "Error!",
                text:
                  error.data?.message ||
                  `Failed to ${selectedBatch ? "update" : "create"} batch`,
                icon: "error",
                background: "#1f2937",
                color: "#fff",
              });
            }
          }}
          isLoading={isCreatingBatch || isUpdatingBatch}
        />
      )}

      {/* View Modal */}
      {showViewModal && (selectedCourse || selectedBatch) && (
        <ViewModal
          type={activeTab === "courses" ? "course" : "batch"}
          data={
            activeTab === "courses"
              ? selectedCourse
              : singleBatchData || selectedBatch
          }
          enrollments={enrollments}
          materials={materials}
          reviews={reviewsData?.reviews}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCourse(null);
            setSelectedBatch(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            if (activeTab === "courses") {
              setShowCourseModal(true);
            } else {
              setShowBatchModal(true);
            }
          }}
          onShowMaterials={() => {
            setShowViewModal(false);
            setShowMaterialModal(true);
          }}
          onShowEnrollments={() => {
            setShowViewModal(false);
            setShowEnrollmentsModal(true);
          }}
          onShowReviews={() => {
            setShowViewModal(false);
            setShowReviewsModal(true);
          }}
        />
      )}

      {/* Materials Modal */}
      {showMaterialModal && selectedBatch && (
        <MaterialsModal
          batch={selectedBatch}
          materials={materials || []}
          onClose={() => {
            setShowMaterialModal(false);
          }}
          onAddMaterial={handleAddMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          isLoading={isAddingMaterial}
        />
      )}

      {/* Enrollments Modal */}
      {showEnrollmentsModal && selectedBatch && (
        <EnrollmentsModal
          batch={selectedBatch}
          enrollments={enrollments || []}
          onClose={() => {
            setShowEnrollmentsModal(false);
          }}
          onEnrollStudent={handleEnrollStudent}
        />
      )}

      {/* Reviews Modal */}
      {showReviewsModal && selectedBatch && (
        <ReviewsModal
          batch={selectedBatch}
          reviews={reviewsData?.reviews || []}
          stats={reviewsData?.stats}
          onClose={() => {
            setShowReviewsModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BatchManagement;

// =============================================
// COURSE MODAL
// =============================================

interface CourseModalProps {
  mode: "create" | "edit";
  course?: Course | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const CourseModal = ({
  mode,
  course,
  onClose,
  onSubmit,
  isLoading,
}: CourseModalProps) => {
  const [form, setForm] = useState({
    title: course?.title || "",
    subject: course?.subject || "",
    description: course?.description || "",
    category: course?.category || "Science",
    level: course?.level || "BEGINNER",
    duration: course?.duration || "",
    price: course?.price || 0,
    offerPrice: course?.offerPrice || "",
    isFree: course?.isFree || false,
    teacherId: course?.teacherId || "",
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
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Course" : "Edit Course"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
          </div>

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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

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
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Offer Price
              </label>
              <input
                type="number"
                name="offerPrice"
                value={form.offerPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFree"
              checked={form.isFree}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-300">Free Course</label>
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
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Course"
                  : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// BATCH MODAL
// =============================================

interface BatchModalProps {
  mode: "create" | "edit";
  batch?: Batch | null;
  courses: Course[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const BatchModal = ({
  mode,
  batch,
  courses,
  onClose,
  onSubmit,
  isLoading,
}: BatchModalProps) => {
  const [form, setForm] = useState({
    name: batch?.name || "",
    courseId: batch?.courseId || "",
    subject: batch?.subject || "",
    description: batch?.description || "",
    mode: batch?.mode || "ONLINE",
    language: batch?.language || "English",
    maxStudents: batch?.maxStudents || "",
    startDate: batch?.startDate?.split("T")[0] || "",
    endDate: batch?.endDate?.split("T")[0] || "",
    price: batch?.price || 0,
    offerPrice: batch?.offerPrice || "",
    isActive: batch?.isActive ?? true,
    enrollmentOpen: batch?.enrollmentOpen ?? true,
    visibility: batch?.visibility || "PUBLIC",
    topics: batch?.topics?.join(", ") || "",
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
      maxStudents: form.maxStudents ? parseInt(form.maxStudents) : null,
      topics: form.topics
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
            {mode === "create" ? "Create New Batch" : "Edit Batch"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Batch Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course *
              </label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                required
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mode
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Students
              </label>
              <input
                type="number"
                name="maxStudents"
                value={form.maxStudents}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
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
                placeholder="Quantum, Mechanics, Waves"
              />
            </div>
          </div>

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
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Offer Price
              </label>
              <input
                type="number"
                name="offerPrice"
                value={form.offerPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="enrollmentOpen"
                checked={form.enrollmentOpen}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Enrollment Open</span>
            </label>
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
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Batch"
                  : "Update Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW MODAL
// =============================================

interface ViewModalProps {
  type: "course" | "batch";
  data: any;
  enrollments?: Enrollment[];
  materials?: BatchMaterial[];
  reviews?: Review[];
  onClose: () => void;
  onEdit: () => void;
  onShowMaterials?: () => void;
  onShowEnrollments?: () => void;
  onShowReviews?: () => void;
}

const ViewModal = ({
  type,
  data,
  enrollments,
  materials,
  reviews,
  onClose,
  onEdit,
  onShowMaterials,
  onShowEnrollments,
  onShowReviews,
}: ViewModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "materials" | "enrollments" | "reviews"
  >("overview");

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {type === "course" ? "Course Details" : "Batch Details"}
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
              {type === "course" ? (
                <BookOpen className="w-8 h-8 text-white" />
              ) : (
                <Layers className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">
                {data?.name || data?.title}
              </h3>
              <p className="text-gray-400">{data?.subject}</p>
            </div>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>
          </div>

          {/* Tabs */}
          {type === "batch" && (
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
                onClick={() => setActiveTab("materials")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "materials"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400"
                }`}
              >
                Materials ({materials?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("enrollments")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "enrollments"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400"
                }`}
              >
                Enrollments ({enrollments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "reviews"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400"
                }`}
              >
                Reviews ({reviews?.length || 0})
              </button>
            </div>
          )}

          {/* Content */}
          {type === "course" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-white">{data?.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="text-white">{data?.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-white">{data?.duration || "N/A"} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-white">
                    {data?.isFree ? "Free" : `₹${data?.price}`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-white">
                  {data?.description || "No description"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="text-white">{data?.course?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teacher</p>
                      <p className="text-white">{data?.teacher?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mode</p>
                      <p className="text-white">{data?.mode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Language</p>
                      <p className="text-white">{data?.language}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="text-white">
                        {formatDate(data?.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="text-white">{formatDate(data?.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-white">₹{data?.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Enrollments</p>
                      <p className="text-white">
                        {data?.currentEnrollments}/{data?.maxStudents || "∞"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-white">
                      {data?.description || "No description"}
                    </p>
                  </div>
                  {data?.topics?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {data.topics.map((topic: string, i: number) => (
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
                </div>
              )}

              {activeTab === "materials" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">Study Materials</h4>
                    <button
                      onClick={onShowMaterials}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      Add Material
                    </button>
                  </div>
                  {materials?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No materials added yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {materials?.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-white">{material.title}</p>
                              <p className="text-xs text-gray-500">
                                {material.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {material.downloads} downloads
                            </span>
                            {material.fileUrl && (
                              <a
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-white/5 rounded"
                              >
                                <Download className="w-4 h-4 text-gray-400" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "enrollments" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">
                      Enrolled Students
                    </h4>
                    <button
                      onClick={onShowEnrollments}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    >
                      Manage Enrollments
                    </button>
                  </div>
                  {enrollments?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No enrollments yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {enrollments?.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {enrollment.student?.name?.charAt(0) || "S"}
                              </span>
                            </div>
                            <div>
                              <p className="text-white">
                                {enrollment.student?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {enrollment.student?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                enrollment.status === "APPROVED"
                                  ? "bg-green-500/20 text-green-400"
                                  : enrollment.status === "PENDING"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {enrollment.status}
                            </span>
                            <span className="text-sm text-white">
                              ₹{enrollment.paidAmount}/₹{enrollment.totalFees}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">Student Reviews</h4>
                    <button
                      onClick={onShowReviews}
                      className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                    >
                      View All Reviews
                    </button>
                  </div>
                  {reviews?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No reviews yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reviews?.slice(0, 3).map((review) => (
                        <div
                          key={review.id}
                          className="p-3 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-white text-sm">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {review.student?.name} •{" "}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================
// MATERIALS MODAL
// =============================================

interface MaterialsModalProps {
  batch: Batch;
  materials: BatchMaterial[];
  onClose: () => void;
  onAddMaterial: (data: any) => void;
  onDeleteMaterial: (id: string) => void;
  isLoading?: boolean;
}

const MaterialsModal = ({
  batch,
  materials,
  onClose,
  onAddMaterial,
  onDeleteMaterial,
  isLoading,
}: MaterialsModalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "NOTE",
    fileUrl: "",
    isFree: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaterial(form);
    setShowAddForm(false);
    setForm({
      title: "",
      description: "",
      type: "NOTE",
      fileUrl: "",
      isFree: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Materials - {batch.name}
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
            <h3 className="text-white font-medium">All Materials</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              {showAddForm ? "Cancel" : "Add New"}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-gray-800/50 rounded-lg space-y-3"
            >
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              >
                <option value="NOTE">Note</option>
                <option value="VIDEO">Video</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="PRACTICE_SET">Practice Set</option>
                <option value="REFERENCE">Reference</option>
                <option value="FORMULA_SHEET">Formula Sheet</option>
              </select>
              <input
                type="url"
                placeholder="File URL"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) =>
                    setForm({ ...form, isFree: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Free Material</span>
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Material"}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {materials.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No materials added yet
              </p>
            ) : (
              materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white">{material.title}</p>
                      <p className="text-xs text-gray-500">{material.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {material.downloads} downloads
                    </span>
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-white/5 rounded"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                    <button
                      onClick={() => onDeleteMaterial(material.id)}
                      className="p-1 hover:bg-red-500/10 rounded text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
// ENROLLMENTS MODAL
// =============================================

interface EnrollmentsModalProps {
  batch: Batch;
  enrollments: Enrollment[];
  onClose: () => void;
  onEnrollStudent: (studentId: string) => void;
}

const EnrollmentsModal = ({
  batch,
  enrollments,
  onClose,
  onEnrollStudent,
}: EnrollmentsModalProps) => {
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [studentId, setStudentId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnrollStudent(studentId);
    setShowEnrollForm(false);
    setStudentId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Enrollments - {batch.name}
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
              Enrolled Students ({enrollments.length})
            </h3>
            <button
              onClick={() => setShowEnrollForm(!showEnrollForm)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              {showEnrollForm ? "Cancel" : "Enroll Student"}
            </button>
          </div>

          {showEnrollForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-gray-800/50 rounded-lg"
            >
              <input
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white mb-3"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Enroll Student
              </button>
            </form>
          )}

          <div className="space-y-2">
            {enrollments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No enrollments yet
              </p>
            ) : (
              enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {enrollment.student?.name?.charAt(0) || "S"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white">{enrollment.student?.name}</p>
                      <p className="text-xs text-gray-500">
                        {enrollment.student?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        enrollment.status === "APPROVED"
                          ? "bg-green-500/20 text-green-400"
                          : enrollment.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {enrollment.status}
                    </span>
                    <span className="text-sm text-white">
                      ₹{enrollment.paidAmount}/₹{enrollment.totalFees}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(enrollment.appliedAt).toLocaleDateString()}
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
// REVIEWS MODAL
// =============================================

interface ReviewsModalProps {
  batch: Batch;
  reviews: Review[];
  stats?: any;
  onClose: () => void;
}

const ReviewsModal = ({
  batch,
  reviews,
  stats,
  onClose,
}: ReviewsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Reviews - {batch.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Rating Summary */}
          {stats && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-400">out of 5</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-8">
                        {rating}★
                      </span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${reviews.length ? (stats.distribution[rating] / reviews.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">
                        {stats.distribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white mb-2">{review.comment}</p>
                  {review.pros.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-green-400 mb-1">Pros:</p>
                      <div className="flex flex-wrap gap-1">
                        {review.pros.map((pro, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs"
                          >
                            {pro}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-red-400 mb-1">Cons:</p>
                      <div className="flex flex-wrap gap-1">
                        {review.cons.map((con, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-xs"
                          >
                            {con}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {review.student?.name} •{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                    {!review.isAnonymous &&
                      review.student &&
                      ` • ${review.student.name}`}
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
