"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useToggleTeacherStatusMutation,
  useGetTeacherStatsQuery,
} from "@/store/api/teacherApi";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Clock,
  Star,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  MoreVertical,
  Users,
} from "lucide-react";

// Types
interface Teacher {
  id: string;
  name: string;
  bio?: string | null;
  qualification?: string | null;
  expertise: string[];
  experience?: number | null;
  institute?: string | null;
  designation?: string | null;
  averageRating: number;
  totalStudents: number;
  totalCourses: number;
  totalBatches: number;
  user: {
    id: string;
    email: string;
    phone: string;
    isActive: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin?: string | null;
    createdAt: string;
  };
  courses?: any[];
  batches?: any[];
  _count?: {
    courses: number;
    batches: number;
    exams: number;
    quizzes: number;
    notes: number;
  };
}

interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  alternatePhone?: string;
  bio?: string;
  qualification?: string;
  expertise: string[];
  experience?: number;
  institute?: string;
  designation?: string;
  achievements: string[];
  employeeId?: string;
  joiningDate?: string;
  specializations: string[];
  gstNumber?: string;
  panNumber?: string;
  upiId?: string;
  website?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface Filters {
  search: string;
  isActive: string;
  subject: string;
  minExperience: string;
}

const AdminTeacherManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    isActive: "",
    subject: "",
    minExperience: "",
  });

  // Queries
  const {
    data: teachersData,
    isLoading,
    error,
    refetch,
  } = useGetTeachersQuery({
    page,
    limit,
    search: filters.search || undefined,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    subject: filters.subject || undefined,
    minExperience: filters.minExperience
      ? parseInt(filters.minExperience)
      : undefined,
  }) as {
    data?: {
      data: Teacher[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  const { data: statsData } = useGetTeacherStatsQuery(undefined, {
    pollingInterval: 30000, // Refresh every 30 seconds
  });

  // Mutations
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleTeacherStatusMutation();

  const teachers = teachersData?.data || [];
  const meta = teachersData?.meta;

  // Handlers
  const handleDelete = async (teacher: Teacher) => {
    const result = await Swal.fire({
      title: "Delete Teacher?",
      text: `Are you sure you want to delete ${teacher.name}? This action cannot be undone.`,
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
        await deleteTeacher(teacher.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Teacher has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedTeacher?.id === teacher.id) {
          setSelectedTeacher(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete teacher",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleToggle = async (teacher: Teacher) => {
    const newStatus = !teacher.user.isActive;
    const result = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} Teacher?`,
      text: `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${teacher.name}?`,
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
          id: teacher.id,
          isActive: newStatus,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `Teacher has been ${newStatus ? "activated" : "deactivated"} successfully.`,
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
    }
  };

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditModal(true);
  };

  const handleCreate = async (formData: TeacherFormData) => {
    try {
      await createTeacher(formData).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Teacher created successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setOpenModal(false);
      refetch();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to create teacher",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (id: string, formData: TeacherFormData) => {
    try {
      await updateTeacher({ id, data: formData }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Teacher updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedTeacher(null);
      refetch();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to update teacher",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    const selectedIds = teachers
      .filter((t) => t.user.isActive)
      .map((t) => t.id);
    if (selectedIds.length === 0) {
      Swal.fire({
        title: "No teachers selected",
        text: "Please select teachers first",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedIds.length} teachers?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "delete" ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}`,
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      // Implement bulk action API call here
      Swal.fire({
        title: "Success!",
        text: `${selectedIds.length} teachers ${action}d successfully`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      isActive: "",
      subject: "",
      minExperience: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-blue-400" />
          Teacher Management
        </h1>
        <p className="text-gray-400">Manage all teachers across the platform</p>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Teachers</h3>
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {statsData.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Active Teachers</h3>
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {statsData.data?.active || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Avg Rating</h3>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {(statsData.data?.topTeachers?.[0]?.averageRating || 4.5).toFixed(
                1,
              )}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Students</h3>
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {teachers.reduce((acc, t) => acc + (t.totalStudents || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-gray-300 font-medium flex items-center gap-2 hover:bg-gray-700 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => refetch()}
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
              placeholder="Search teachers..."
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
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => {
                    setFilters({ ...filters, subject: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Experience
                </label>
                <select
                  value={filters.minExperience}
                  onChange={(e) => {
                    setFilters({ ...filters, minExperience: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Any</option>
                  <option value="2">2+ years</option>
                  <option value="5">5+ years</option>
                  <option value="10">10+ years</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teachers Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load teachers</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Teacher
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Contact
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Qualification
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Experience
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
                  {teachers.map((teacher: Teacher) => (
                    <tr
                      key={teacher.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleView(teacher)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {teacher.name?.charAt(0) || "T"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {teacher.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {teacher.designation || "Teacher"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-white text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            {teacher.user.email}
                          </p>
                          <p className="text-white text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {teacher.user.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          {teacher.qualification || "N/A"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacher.expertise?.slice(0, 2).map((exp, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs"
                            >
                              {exp}
                            </span>
                          ))}
                          {teacher.expertise?.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{teacher.expertise.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-white text-sm">
                            {teacher.experience || 0} years
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            teacher.user.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {teacher.user.isActive ? (
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
                            {formatDate(teacher.user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(teacher);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(teacher);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(teacher);
                            }}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${
                              teacher.user.isActive
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                            title={
                              teacher.user.isActive ? "Deactivate" : "Activate"
                            }
                            disabled={isToggling}
                          >
                            {teacher.user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(teacher);
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
                  teachers
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
      {openModal && (
        <TeacherModal
          mode="create"
          onClose={() => setOpenModal(false)}
          onSubmit={handleCreate}
          isLoading={isCreating}
        />
      )}

      {editModal && selectedTeacher && (
        <TeacherModal
          mode="edit"
          teacher={selectedTeacher}
          onClose={() => {
            setEditModal(false);
            setSelectedTeacher(null);
          }}
          onSubmit={(data) => handleUpdate(selectedTeacher.id, data)}
          isLoading={isUpdating}
        />
      )}

      {viewModal && selectedTeacher && (
        <TeacherViewModal
          teacher={selectedTeacher}
          onClose={() => {
            setViewModal(false);
            setSelectedTeacher(null);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
        />
      )}
    </div>
  );
};

export default AdminTeacherManagement;

/* ================================
TEACHER MODAL (Create/Edit)
================================ */

interface TeacherModalProps {
  mode: "create" | "edit";
  teacher?: Teacher;
  onClose: () => void;
  onSubmit: (data: TeacherFormData) => void;
  isLoading?: boolean;
}

const TeacherModal = ({
  mode,
  teacher,
  onClose,
  onSubmit,
  isLoading,
}: TeacherModalProps) => {
  const [form, setForm] = useState<TeacherFormData>({
    name: teacher?.name || "",
    email: teacher?.user?.email || "",
    phone: teacher?.user?.phone || "",
    password: "",
    alternatePhone: "",
    bio: teacher?.bio || "",
    qualification: teacher?.qualification || "",
    expertise: teacher?.expertise || [],
    experience: teacher?.experience || 0,
    institute: teacher?.institute || "",
    designation: teacher?.designation || "",
    achievements: teacher?.achievements || [],
    employeeId: "",
    joiningDate: "",
    specializations: [],
    gstNumber: "",
    panNumber: "",
    upiId: "",
    website: "",
    linkedin: "",
    youtube: "",
    twitter: "",
    isActive: teacher?.user?.isActive ?? true,
    emailVerified: teacher?.user?.emailVerified ?? false,
    phoneVerified: teacher?.user?.phoneVerified ?? false,
  });

  const [expertiseInput, setExpertiseInput] = useState("");

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

  const addExpertise = () => {
    if (
      expertiseInput.trim() &&
      !form.expertise.includes(expertiseInput.trim())
    ) {
      setForm({
        ...form,
        expertise: [...form.expertise, expertiseInput.trim()],
      });
      setExpertiseInput("");
    }
  };

  const removeExpertise = (item: string) => {
    setForm({
      ...form,
      expertise: form.expertise.filter((e) => e !== item),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto no-scrollbar">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Add New Teacher" : "Edit Teacher"}
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
                  placeholder="Dr. John Doe"
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
                  placeholder="teacher@example.com"
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
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Qualification
                </label>
                <input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Ph.D. in Physics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Experience (years)
                </label>
                <input
                  name="experience"
                  type="number"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Institute
                </label>
                <input
                  name="institute"
                  value={form.institute}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="IIT Bombay"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Designation
                </label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Professor"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Brief description about the teacher..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expertise
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g., Quantum Mechanics"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addExpertise())
                  }
                />
                <button
                  type="button"
                  onClick={addExpertise}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.expertise.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeExpertise(item)}
                      className="hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
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
              {mode === "create" ? "Create Teacher" : "Update Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================================
TEACHER VIEW MODAL
================================ */

interface TeacherViewModalProps {
  teacher: Teacher;
  onClose: () => void;
  onEdit: () => void;
}

const TeacherViewModal = ({
  teacher,
  onClose,
  onEdit,
}: TeacherViewModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "batches" | "exams"
  >("overview");

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
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
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            Teacher Details
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
                {teacher.name?.charAt(0) || "T"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{teacher.name}</h3>
              <p className="text-gray-400">
                {teacher.designation || "Teacher"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    teacher.user.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {teacher.user.isActive ? "Active" : "Inactive"}
                </span>
                {teacher.user.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Email Verified
                  </span>
                )}
                {teacher.user.phoneVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Phone Verified
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Teacher
            </button>
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
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "courses"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Courses ({teacher._count?.courses || 0})
            </button>
            <button
              onClick={() => setActiveTab("batches")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "batches"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Batches ({teacher._count?.batches || 0})
            </button>
            <button
              onClick={() => setActiveTab("exams")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "exams"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Exams ({teacher._count?.exams || 0})
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
                        <p className="text-white">{teacher.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-white">{teacher.user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-white">{teacher.user.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bio</p>
                        <p className="text-white">
                          {teacher.bio || "No bio provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">
                      Professional Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Qualification</p>
                        <p className="text-white">
                          {teacher.qualification || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="text-white">
                          {teacher.experience || 0} years
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Institute</p>
                        <p className="text-white">
                          {teacher.institute || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Designation</p>
                        <p className="text-white">
                          {teacher.designation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <h4 className="font-medium text-white mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacher.expertise?.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {teacher.averageRating?.toFixed(1) || "0.0"}
                    </p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {teacher.totalStudents || 0}
                    </p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <GraduationCap className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {teacher._count?.courses || 0}
                    </p>
                    <p className="text-xs text-gray-500">Courses</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {teacher._count?.batches || 0}
                    </p>
                    <p className="text-xs text-gray-500">Batches</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="text-center py-8 text-gray-400">
                No courses found for this teacher
              </div>
            )}

            {activeTab === "batches" && (
              <div className="text-center py-8 text-gray-400">
                No batches found for this teacher
              </div>
            )}

            {activeTab === "exams" && (
              <div className="text-center py-8 text-gray-400">
                No exams found for this teacher
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
