"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Users,
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
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  GraduationCap,
  Award,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Shield,
  Star,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Home,
  Globe,
  Heart,
  Users as UsersIcon,
  BookMarked,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useToggleStudentStatusMutation,
  useBulkStudentActionMutation,
  useGetStudentStatsQuery,
  useGetStudentByIdQuery,
} from "@/store/api/studentApi";

// Types
interface Student {
  id: string;
  name: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  profileImage?: string | null;
  institute?: string | null;
  educationLevel?: string | null;
  class?: string | null;
  board?: string | null;
  hscYear?: number | null;
  group?: string | null;
  rollNumber?: string | null;
  registrationNumber?: string | null;
  guardianId?: string | null;
  preferredSubjects: string[];
  learningGoals: string[];
  examTargets: string[];
  totalCourses: number;
  averageScore: number;
  attendanceRate: number;
  rank?: number | null;
  percentile?: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    phone: string;
    alternatePhone?: string | null;
    isActive: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin?: string | null;
    createdAt: string;
  };
  guardian?: {
    id: string;
    name: string;
    relationship: string;
    occupation?: string | null;
  } | null;
  enrollments?: any[];
  _count?: {
    enrollments: number;
    attendances: number;
    quizResults: number;
    examResults: number;
    payments: number;
    doubts: number;
  };
}

interface Filters {
  search: string;
  isActive: string;
  class: string;
  board: string;
  educationLevel: string;
  hasGuardian: string;
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  profileImage?: string;
  institute?: string;
  educationLevel?: string;
  class?: string;
  board?: string;
  hscYear?: number;
  group?: string;
  rollNumber?: string;
  registrationNumber?: string;
  guardianId?: string;
  preferredSubjects: string[];
  learningGoals: string[];
  examTargets: string[];
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

const StudentsManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    isActive: "",
    class: "",
    board: "",
    educationLevel: "",
    hasGuardian: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: studentsData,
    isLoading,
    error,
    refetch,
  } = useGetStudentsQuery({
    page,
    limit,
    search: filters.search || undefined,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    class: filters.class || undefined,
    board: filters.board || undefined,
    educationLevel: filters.educationLevel || undefined,
    hasGuardian: filters.hasGuardian
      ? filters.hasGuardian === "true"
      : undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetStudentStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleStudentData, refetch: refetchStudent } =
    useGetStudentByIdQuery(selectedStudent?.id || "", {
      skip: !selectedStudent?.id,
    });

  const students = studentsData?.data || [];
  const meta = studentsData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleStudentStatusMutation();
  const [bulkAction, { isLoading: isBulkAction }] =
    useBulkStudentActionMutation();

  /* ===============================
  ACTIONS
  =============================== */

  const handleDelete = async (student: Student) => {
    const result = await Swal.fire({
      title: "Delete Student?",
      text: `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
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
        await deleteStudent(student.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Student has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedStudent?.id === student.id) {
          setSelectedStudent(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete student",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleToggle = async (student: Student) => {
    const newStatus = !student.user.isActive;
    const result = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} Student?`,
      text: `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${student.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus ? "#10b981" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${newStatus ? "activate" : "deactivate"}`,
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await toggleStatus({
          id: student.id,
          isActive: newStatus,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `Student has been ${newStatus ? "activated" : "deactivated"} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedStudent?.id === student.id) {
          refetchStudent();
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
    }
  };

  const handleBulkDeactivate = async () => {
    if (!selectedStudents.length) {
      Swal.fire({
        title: "No students selected",
        text: "Please select at least one student",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Deactivate?",
      text: `Are you sure you want to deactivate ${selectedStudents.length} students?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, deactivate",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await bulkAction({
          studentIds: selectedStudents,
          action: "deactivate",
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedStudents.length} students deactivated successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedStudents([]);
        setSelectAll(false);
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to deactivate students",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleBulkActivate = async () => {
    if (!selectedStudents.length) {
      Swal.fire({
        title: "No students selected",
        text: "Please select at least one student",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Activate?",
      text: `Are you sure you want to activate ${selectedStudents.length} students?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, activate",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await bulkAction({
          studentIds: selectedStudents,
          action: "activate",
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedStudents.length} students activated successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedStudents([]);
        setSelectAll(false);
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to activate students",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedStudents.length) {
      Swal.fire({
        title: "No students selected",
        text: "Please select at least one student",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`,
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
        await bulkAction({
          studentIds: selectedStudents,
          action: "delete",
        }).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: `${selectedStudents.length} students deleted successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedStudents([]);
        setSelectAll(false);
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete students",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleSelect = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setViewModal(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditModal(true);
  };

  const handleCreate = async (formData: StudentFormData) => {
    try {
      await createStudent(formData).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Student created successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setOpenModal(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to create student",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (id: string, formData: StudentFormData) => {
    try {
      await updateStudent({ id, data: formData }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Student updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedStudent(null);
      refetch();
      refetchStats();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to update student",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      isActive: "",
      class: "",
      board: "",
      educationLevel: "",
      hasGuardian: "",
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

  // Calculate age
  const calculateAge = (dob?: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /* ===============================
  UI
  =============================== */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          Student Management
        </h1>
        <p className="text-gray-400">Manage all students across the platform</p>
      </div>

      {/* ===============================
      STATS CARDS
      =============================== */}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Students</h3>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Active Students</h3>
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.active || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Avg. Score</h3>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.topPerformers?.[0]?.averageScore?.toFixed(1) ||
                "0.0"}
              %
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Guardian Coverage</h3>
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.guardianCoverage?.percentage || 0}%
            </p>
          </div>
        </div>
      )}

      {/* ===============================
      FILTERS
      =============================== */}

      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Student
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
              placeholder="Search students..."
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
                  value={filters.isActive}
                  onChange={(e) => {
                    setFilters({ ...filters, isActive: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Class
                </label>
                <select
                  value={filters.class}
                  onChange={(e) => {
                    setFilters({ ...filters, class: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Board
                </label>
                <select
                  value={filters.board}
                  onChange={(e) => {
                    setFilters({ ...filters, board: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Education Level
                </label>
                <select
                  value={filters.educationLevel}
                  onChange={(e) => {
                    setFilters({ ...filters, educationLevel: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Guardian
                </label>
                <select
                  value={filters.hasGuardian}
                  onChange={(e) => {
                    setFilters({ ...filters, hasGuardian: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Has Guardian</option>
                  <option value="false">No Guardian</option>
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

      {/* ===============================
      BULK ACTIONS
      =============================== */}

      {selectedStudents.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedStudents.length}</span>{" "}
            students selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleBulkActivate}
              disabled={isBulkAction}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4" />
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              disabled={isBulkAction}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <UserX className="w-4 h-4" />
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkAction}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ===============================
      STUDENTS TABLE
      =============================== */}

      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load students</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectAll && students.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Student
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Contact
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Class/Board
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Performance
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Joined
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: Student) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleView(student)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelect(student.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {student.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Roll: {student.rollNumber || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-white text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            {student.user.email}
                          </p>
                          <p className="text-white text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {student.user.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          Class {student.class || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.board || "N/A"} •{" "}
                          {student.educationLevel || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span className="text-white text-sm">
                              {student.averageScore?.toFixed(1) || "0"}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">
                              Rank: {student.rank || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            student.user.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {student.user.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {formatDate(student.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(student);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(student);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(student);
                            }}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${
                              student.user.isActive
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                            title={
                              student.user.isActive ? "Deactivate" : "Activate"
                            }
                            disabled={isToggling}
                          >
                            {student.user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student);
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
                  students
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

      {/* ===============================
      MODALS
      =============================== */}

      {/* Add Student Modal */}
      {openModal && (
        <StudentModal
          mode="create"
          onClose={() => setOpenModal(false)}
          onSubmit={handleCreate}
          isLoading={isCreating}
        />
      )}

      {/* Edit Student Modal */}
      {editModal && selectedStudent && (
        <StudentModal
          mode="edit"
          student={selectedStudent}
          onClose={() => {
            setEditModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={(data) => handleUpdate(selectedStudent.id, data)}
          isLoading={isUpdating}
        />
      )}

      {/* View Student Modal */}
      {viewModal && selectedStudent && (
        <StudentViewModal
          student={singleStudentData || selectedStudent}
          onClose={() => {
            setViewModal(false);
            setSelectedStudent(null);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default StudentsManagement;

/* ===============================
STUDENT MODAL (Create/Edit)
=============================== */

interface StudentModalProps {
  mode: "create" | "edit";
  student?: Student;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  isLoading?: boolean;
}

const StudentModal = ({
  mode,
  student,
  onClose,
  onSubmit,
  isLoading,
}: StudentModalProps) => {
  const [form, setForm] = useState<StudentFormData>({
    name: student?.name || "",
    email: student?.user?.email || "",
    phone: student?.user?.phone || "",
    password: "",
    alternatePhone: student?.user?.alternatePhone || "",
    dateOfBirth: student?.dateOfBirth?.split("T")[0] || "",
    gender: student?.gender || "",
    address: student?.address || "",
    city: student?.city || "",
    state: student?.state || "",
    country: student?.country || "",
    pincode: student?.pincode || "",
    profileImage: student?.profileImage || "",
    institute: student?.institute || "",
    educationLevel: student?.educationLevel || "",
    class: student?.class || "",
    board: student?.board || "",
    hscYear: student?.hscYear || undefined,
    group: student?.group || "",
    rollNumber: student?.rollNumber || "",
    registrationNumber: student?.registrationNumber || "",
    guardianId: student?.guardianId || "",
    preferredSubjects: student?.preferredSubjects || [],
    learningGoals: student?.learningGoals || [],
    examTargets: student?.examTargets || [],
    isActive: student?.user?.isActive ?? true,
    emailVerified: student?.user?.emailVerified ?? false,
    phoneVerified: student?.user?.phoneVerified ?? false,
  });

  const [subjectInput, setSubjectInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [targetInput, setTargetInput] = useState("");

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

  const addSubject = () => {
    if (
      subjectInput.trim() &&
      !form.preferredSubjects.includes(subjectInput.trim())
    ) {
      setForm({
        ...form,
        preferredSubjects: [...form.preferredSubjects, subjectInput.trim()],
      });
      setSubjectInput("");
    }
  };

  const removeSubject = (item: string) => {
    setForm({
      ...form,
      preferredSubjects: form.preferredSubjects.filter((s) => s !== item),
    });
  };

  const addGoal = () => {
    if (goalInput.trim() && !form.learningGoals.includes(goalInput.trim())) {
      setForm({
        ...form,
        learningGoals: [...form.learningGoals, goalInput.trim()],
      });
      setGoalInput("");
    }
  };

  const removeGoal = (item: string) => {
    setForm({
      ...form,
      learningGoals: form.learningGoals.filter((g) => g !== item),
    });
  };

  const addTarget = () => {
    if (targetInput.trim() && !form.examTargets.includes(targetInput.trim())) {
      setForm({
        ...form,
        examTargets: [...form.examTargets, targetInput.trim()],
      });
      setTargetInput("");
    }
  };

  const removeTarget = (item: string) => {
    setForm({
      ...form,
      examTargets: form.examTargets.filter((t) => t !== item),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto no-scrollbar">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Add New Student" : "Edit Student"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={mode === "edit"}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="+919876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone
                </label>
                <input
                  name="alternatePhone"
                  value={form.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="+919876543211"
                />
              </div>

              {mode === "create" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State
                </label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Institute
                </label>
                <input
                  name="institute"
                  value={form.institute}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Delhi Public School"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Education Level
                </label>
                <select
                  name="educationLevel"
                  value={form.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Select Level</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Class
                </label>
                <input
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Board
                </label>
                <select
                  name="board"
                  value={form.board}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HSC Year
                </label>
                <input
                  name="hscYear"
                  type="number"
                  value={form.hscYear || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group
                </label>
                <select
                  name="group"
                  value={form.group}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Select Group</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roll Number
                </label>
                <input
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Number
                </label>
                <input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="REG2024001"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Preferences</h3>

            {/* Preferred Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Subjects
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g., Physics"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSubject())
                  }
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.preferredSubjects.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeSubject(item)}
                      className="hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Goals
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g., IIT JEE"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addGoal())
                  }
                />
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.learningGoals.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeGoal(item)}
                      className="hover:text-green-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Exam Targets */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exam Targets
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g., JEE Advanced"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTarget())
                  }
                />
                <button
                  type="button"
                  onClick={addTarget}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.examTargets.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeTarget(item)}
                      className="hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Guardian Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Guardian ID
              </label>
              <input
                name="guardianId"
                value={form.guardianId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Guardian ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if no guardian
              </p>
            </div>
          </div>

          {/* Status Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Status Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  name="emailVerified"
                  type="checkbox"
                  checked={form.emailVerified}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Email Verified</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  name="phoneVerified"
                  type="checkbox"
                  checked={form.phoneVerified}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Phone Verified</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "create" ? "Create Student" : "Update Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===============================
STUDENT VIEW MODAL
=============================== */

interface StudentViewModalProps {
  student: any;
  onClose: () => void;
  onEdit: () => void;
  onToggle: (student: any) => void;
  onDelete: (student: any) => void;
}

const StudentViewModal = ({
  student,
  onClose,
  onEdit,
  onToggle,
  onDelete,
}: StudentViewModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "academic" | "enrollments" | "performance"
  >("overview");

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate age
  const calculateAge = (dob?: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Student Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-white/10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-3xl font-medium text-white">
                {student.name?.charAt(0) || "S"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{student.name}</h3>
              <p className="text-gray-400">
                {student.class ? `Class ${student.class}` : "Student"} •{" "}
                {student.board || "N/A"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    student.user?.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {student.user?.isActive ? "Active" : "Inactive"}
                </span>
                {student.user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Email Verified
                  </span>
                )}
                {student.user?.phoneVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Phone Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onToggle(student)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  student.user?.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {student.user?.isActive ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Activate
                  </>
                )}
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(student)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "overview"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("academic")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "academic"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setActiveTab("enrollments")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "enrollments"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Enrollments ({student._count?.enrollments || 0})
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "performance"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Performance
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-white">{student.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-white">
                          {student.dateOfBirth
                            ? `${formatDate(student.dateOfBirth)} (${calculateAge(student.dateOfBirth)} years)`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-white">{student.gender || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-white">
                          {student.address
                            ? `${student.address}${student.city ? `, ${student.city}` : ""}${student.state ? `, ${student.state}` : ""}${student.pincode ? ` - ${student.pincode}` : ""}`
                            : "No address provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-white">{student.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-white">{student.user?.phone}</p>
                      </div>
                      {student.user?.alternatePhone && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Alternate Phone
                          </p>
                          <p className="text-white">
                            {student.user.alternatePhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                {student.guardian && (
                  <div>
                    <h4 className="font-medium text-white mb-3">
                      Guardian Information
                    </h4>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-white font-medium">
                        {student.guardian.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {student.guardian.relationship} •{" "}
                        {student.guardian.occupation || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div>
                  <h4 className="font-medium text-white mb-3">Preferences</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Preferred Subjects
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {student.preferredSubjects?.map(
                          (item: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Learning Goals
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {student.learningGoals?.map(
                          (item: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Exam Targets</p>
                      <div className="flex flex-wrap gap-2">
                        {student.examTargets?.map(
                          (item: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">
                    Academic Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Institute</p>
                      <p className="text-white">{student.institute || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Education Level</p>
                      <p className="text-white">
                        {student.educationLevel || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Class</p>
                      <p className="text-white">{student.class || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Board</p>
                      <p className="text-white">{student.board || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-3">
                    Examination Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">HSC Year</p>
                      <p className="text-white">{student.hscYear || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Group</p>
                      <p className="text-white">{student.group || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Roll Number</p>
                      <p className="text-white">
                        {student.rollNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Registration Number
                      </p>
                      <p className="text-white">
                        {student.registrationNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "enrollments" && (
              <div className="text-center py-8 text-gray-400">
                No enrollments found for this student
              </div>
            )}

            {activeTab === "performance" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {student.averageScore?.toFixed(1) || "0"}%
                  </p>
                  <p className="text-xs text-gray-500">Average Score</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {student.rank || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Rank</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {student.attendanceRate?.toFixed(1) || "0"}%
                  </p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
