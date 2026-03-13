// src/app/dashboard/admin/guardians/page.tsx
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
  Briefcase,
  Heart,
  Users as UsersIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Star,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  BookOpen,
} from "lucide-react";

import {
  useGetGuardiansQuery,
  useGetGuardianByIdQuery,
  useGetGuardianStatsQuery,
  useGetGuardianStudentsQuery,
  useCreateGuardianMutation,
  useUpdateGuardianMutation,
  useDeleteGuardianMutation,
  useToggleGuardianStatusMutation,
  useBulkGuardianActionMutation,
  useAddStudentsToGuardianMutation,
  useRemoveStudentsFromGuardianMutation,
} from "@/store/api/guardianApi";

// Types
interface Guardian {
  id: string;
  name: string;
  relationship: string;
  occupation?: string | null;
  income?: number | null;
  notificationPrefs?: any;
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
  }; // Make user required, not optional
  students?: Array<{
    id: string;
    name: string;
    class?: string | null;
    institute?: string | null;
  }>;
  _count?: {
    students: number;
    comments: number;
    postReactions: number;
  };
}

interface Filters {
  search: string;
  isActive: string;
  relationship: string;
  hasStudents: string;
}

interface GuardianFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  alternatePhone?: string;
  relationship: string;
  occupation?: string;
  income?: number;
  notificationPrefs?: any;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

const GuardianManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedGuardians, setSelectedGuardians] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [assignStudentsModal, setAssignStudentsModal] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(
    null,
  );
  const [filters, setFilters] = useState<Filters>({
    search: "",
    isActive: "",
    relationship: "",
    hasStudents: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: guardiansData,
    isLoading,
    error,
    refetch,
  } = useGetGuardiansQuery({
    page,
    limit,
    search: filters.search || undefined,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    relationship: filters.relationship || undefined,
    hasStudents: filters.hasStudents
      ? filters.hasStudents === "true"
      : undefined,
  }) as {
    data?: {
      data: Guardian[];
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

  const { data: stats, refetch: refetchStats } = useGetGuardianStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleGuardianData, refetch: refetchGuardian } =
    useGetGuardianByIdQuery(selectedGuardian?.id || "", {
      skip: !selectedGuardian?.id,
    });

  const { data: guardianStudents, refetch: refetchStudents } =
    useGetGuardianStudentsQuery(selectedGuardian?.id || "", {
      skip: !selectedGuardian?.id,
    });

  const guardians = guardiansData?.data || [];
  const meta = guardiansData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [createGuardian, { isLoading: isCreating }] =
    useCreateGuardianMutation();
  const [updateGuardian, { isLoading: isUpdating }] =
    useUpdateGuardianMutation();
  const [deleteGuardian, { isLoading: isDeleting }] =
    useDeleteGuardianMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleGuardianStatusMutation();
  const [bulkAction, { isLoading: isBulkAction }] =
    useBulkGuardianActionMutation();
  const [addStudents] = useAddStudentsToGuardianMutation();
  const [removeStudents] = useRemoveStudentsFromGuardianMutation();

  /* ===============================
  ACTIONS
  =============================== */

  const handleDelete = async (guardian: Guardian) => {
    const result = await Swal.fire({
      title: "Delete Guardian?",
      text: `Are you sure you want to delete ${guardian.name}? This action cannot be undone.`,
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
        await deleteGuardian(guardian.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Guardian has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedGuardian?.id === guardian.id) {
          setSelectedGuardian(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete guardian",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleToggle = async (guardian: Guardian) => {
    const newStatus = !guardian.user.isActive;
    const result = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} Guardian?`,
      text: `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${guardian.name}?`,
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
          id: guardian.id,
          isActive: newStatus,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `Guardian has been ${newStatus ? "activated" : "deactivated"} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedGuardian?.id === guardian.id) {
          refetchGuardian();
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

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (!selectedGuardians.length) {
      Swal.fire({
        title: "No guardians selected",
        text: "Please select at least one guardian",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}d`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedGuardians.length} guardians?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor:
        action === "delete"
          ? "#ef4444"
          : action === "activate"
            ? "#10b981"
            : "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}`,
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await bulkAction({
          guardianIds: selectedGuardians,
          action,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedGuardians.length} guardians ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedGuardians([]);
        setSelectAll(false);
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} guardians`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleSelect = (id: string) => {
    if (selectedGuardians.includes(id)) {
      setSelectedGuardians(selectedGuardians.filter((s) => s !== id));
    } else {
      setSelectedGuardians([...selectedGuardians, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedGuardians([]);
    } else {
      setSelectedGuardians(guardians.map((g) => g.id));
    }
    setSelectAll(!selectAll);
  };

  const handleView = (guardian: Guardian) => {
    setSelectedGuardian(guardian);
    setViewModal(true);
  };

  const handleEdit = (guardian: Guardian) => {
    setSelectedGuardian(guardian);
    setEditModal(true);
  };

  const handleAssignStudents = (guardian: Guardian) => {
    setSelectedGuardian(guardian);
    setAssignStudentsModal(true);
  };

  const handleCreate = async (formData: GuardianFormData) => {
    try {
      await createGuardian(formData).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Guardian created successfully",
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
        text: err.data?.message || "Failed to create guardian",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (id: string, formData: GuardianFormData) => {
    try {
      await updateGuardian({ id, data: formData }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Guardian updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedGuardian(null);
      refetch();
      refetchStats();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to update guardian",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleRemoveStudent = async (guardianId: string, studentId: string) => {
    const result = await Swal.fire({
      title: "Remove Student?",
      text: "Are you sure you want to remove this student from the guardian?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await removeStudents({
          guardianId,
          studentIds: [studentId],
        }).unwrap();
        Swal.fire({
          title: "Removed!",
          text: "Student removed successfully",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchStudents();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to remove student",
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
      isActive: "",
      relationship: "",
      hasStudents: "",
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

  // Get relationship badge color
  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case "father":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "mother":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "guardian":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-pink-400" />
          Guardian Management
        </h1>
        <p className="text-gray-400">
          Manage all parents and guardians across the platform
        </p>
      </div>

      {/* ===============================
      STATS CARDS
      =============================== */}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Guardians</h3>
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Active</h3>
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.active || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">With Students</h3>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.withStudents || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Coverage</h3>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.coverageRate || 0}%
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
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Guardian
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
              placeholder="Search guardians..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relationship
                </label>
                <select
                  value={filters.relationship}
                  onChange={(e) => {
                    setFilters({ ...filters, relationship: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                  <option value="">All</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Students
                </label>
                <select
                  value={filters.hasStudents}
                  onChange={(e) => {
                    setFilters({ ...filters, hasStudents: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Has Students</option>
                  <option value="false">No Students</option>
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

      {selectedGuardians.length > 0 && (
        <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-between">
          <p className="text-pink-400">
            <span className="font-bold">{selectedGuardians.length}</span>{" "}
            guardians selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleBulkAction("activate")}
              disabled={isBulkAction}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4" />
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("deactivate")}
              disabled={isBulkAction}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <UserX className="w-4 h-4" />
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
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
      GUARDIANS TABLE
      =============================== */}

      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load guardians</p>
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
                        checked={selectAll && guardians.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Guardian
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Contact
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Relationship
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Occupation
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Students
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
                  {guardians.map((guardian: Guardian) => (
                    <tr
                      key={guardian.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleView(guardian)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedGuardians.includes(guardian.id)}
                          onChange={() => handleSelect(guardian.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {guardian.name?.charAt(0) || "G"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {guardian.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-white text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            {guardian.user?.email || "N/A"}
                          </p>
                          <p className="text-white text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {guardian.user?.phone || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRelationshipColor(guardian.relationship)}`}
                        >
                          <Heart className="w-3 h-3" />
                          {guardian.relationship}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          {guardian.occupation || "N/A"}
                        </p>
                        {guardian.income && (
                          <p className="text-xs text-gray-500">
                            ₹{guardian.income.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-white text-sm">
                            {guardian._count?.students || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            guardian.user?.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {guardian.user?.isActive ? (
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
                            {formatDate(guardian.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(guardian);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(guardian);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-pink-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignStudents(guardian);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Assign Students"
                          >
                            <Users className="w-4 h-4 text-purple-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(guardian);
                            }}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${
                              guardian.user?.isActive
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                            title={
                              guardian.user?.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            disabled={isToggling}
                          >
                            {guardian.user?.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(guardian);
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
                  guardians
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

      {/* Add/Edit Guardian Modal */}
      {(openModal || editModal) && (
        <GuardianModal
          mode={openModal ? "create" : "edit"}
          guardian={editModal ? selectedGuardian : undefined}
          onClose={() => {
            setOpenModal(false);
            setEditModal(false);
            setSelectedGuardian(null);
          }}
          onSubmit={
            openModal
              ? handleCreate
              : (data) => handleUpdate(selectedGuardian!.id, data)
          }
          isLoading={openModal ? isCreating : isUpdating}
        />
      )}

      {/* View Guardian Modal */}
      {viewModal && selectedGuardian && (
        <GuardianViewModal
          guardian={singleGuardianData || selectedGuardian}
          students={guardianStudents || []}
          onClose={() => {
            setViewModal(false);
            setSelectedGuardian(null);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onRemoveStudent={handleRemoveStudent}
          onAssignStudents={() => {
            setViewModal(false);
            setAssignStudentsModal(true);
          }}
        />
      )}

      {/* Assign Students Modal */}
      {assignStudentsModal && selectedGuardian && (
        <AssignStudentsModal
          guardianId={selectedGuardian.id}
          guardianName={selectedGuardian.name}
          currentStudents={guardianStudents || []}
          onClose={() => {
            setAssignStudentsModal(false);
            setSelectedGuardian(null);
          }}
          onAssign={async (studentIds) => {
            try {
              await addStudents({
                guardianId: selectedGuardian.id,
                studentIds,
              }).unwrap();
              Swal.fire({
                title: "Success!",
                text: "Students assigned successfully",
                icon: "success",
                background: "#1f2937",
                color: "#fff",
                timer: 2000,
              });
              refetchStudents();
              setAssignStudentsModal(false);
            } catch (error: any) {
              Swal.fire({
                title: "Error!",
                text: error.data?.message || "Failed to assign students",
                icon: "error",
                background: "#1f2937",
                color: "#fff",
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default GuardianManagement;

/* ===============================
GUARDIAN MODAL (Create/Edit)
=============================== */

interface GuardianModalProps {
  mode: "create" | "edit";
  guardian?: Guardian | null;
  onClose: () => void;
  onSubmit: (data: GuardianFormData) => void;
  isLoading?: boolean;
}

const GuardianModal = ({
  mode,
  guardian,
  onClose,
  onSubmit,
  isLoading,
}: GuardianModalProps) => {
  const [form, setForm] = useState<GuardianFormData>({
    name: guardian?.name || "",
    email: guardian?.user?.email || "",
    phone: guardian?.user?.phone || "",
    password: "",
    alternatePhone: guardian?.user?.alternatePhone || "",
    relationship: guardian?.relationship || "",
    occupation: guardian?.occupation || "",
    income: guardian?.income || undefined,
    isActive: guardian?.user?.isActive ?? true,
    emailVerified: guardian?.user?.emailVerified ?? false,
    phoneVerified: guardian?.user?.phoneVerified ?? false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto no-scrollbar">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Add New Guardian" : "Edit Guardian"}
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
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  placeholder="Suresh Patel"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
                  placeholder="guardian@example.com"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
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
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relationship *
                </label>
                <select
                  name="relationship"
                  value={form.relationship}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                  <option value="">Select Relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  placeholder="Business Owner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Annual Income (₹)
                </label>
                <input
                  name="income"
                  type="number"
                  value={form.income || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  placeholder="500000"
                />
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
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-300">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  name="emailVerified"
                  type="checkbox"
                  checked={form.emailVerified}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-300">Email Verified</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  name="phoneVerified"
                  type="checkbox"
                  checked={form.phoneVerified}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
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
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "create" ? "Create Guardian" : "Update Guardian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===============================
GUARDIAN VIEW MODAL
=============================== */

interface GuardianViewModalProps {
  guardian: any;
  students: any[];
  onClose: () => void;
  onEdit: () => void;
  onToggle: (guardian: any) => void;
  onDelete: (guardian: any) => void;
  onRemoveStudent: (guardianId: string, studentId: string) => void;
  onAssignStudents: () => void;
}

const GuardianViewModal = ({
  guardian,
  students,
  onClose,
  onEdit,
  onToggle,
  onDelete,
  onRemoveStudent,
  onAssignStudents,
}: GuardianViewModalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "students">(
    "overview",
  );

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
            <Heart className="w-5 h-5 text-pink-400" />
            Guardian Details
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-3xl font-medium text-white">
                {guardian.name?.charAt(0) || "G"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{guardian.name}</h3>
              <p className="text-gray-400">{guardian.relationship}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    guardian.user?.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {guardian.user?.isActive ? "Active" : "Inactive"}
                </span>
                {guardian.user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Email Verified
                  </span>
                )}
                {guardian.user?.phoneVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Phone Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onToggle(guardian)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  guardian.user?.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {guardian.user?.isActive ? (
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
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "overview"
                  ? "text-pink-400 border-b-2 border-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "students"
                  ? "text-pink-400 border-b-2 border-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Students ({students.length})
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
                        <p className="text-white">{guardian.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Relationship</p>
                        <p className="text-white">{guardian.relationship}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Occupation</p>
                        <p className="text-white">
                          {guardian.occupation || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Annual Income</p>
                        <p className="text-white">
                          {guardian.income
                            ? `₹${guardian.income.toLocaleString()}`
                            : "N/A"}
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
                        <p className="text-white">{guardian.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-white">{guardian.user?.phone}</p>
                      </div>
                      {guardian.user?.alternatePhone && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Alternate Phone
                          </p>
                          <p className="text-white">
                            {guardian.user.alternatePhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h4 className="font-medium text-white mb-3">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">User ID</p>
                      <p className="text-white text-sm font-mono">
                        {guardian.userId}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Joined Date</p>
                      <p className="text-white">
                        {formatDate(guardian.createdAt)}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Last Login</p>
                      <p className="text-white">
                        {guardian.user?.lastLogin
                          ? formatDate(guardian.user.lastLogin)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-white">
                    Associated Students
                  </h4>
                  <button
                    onClick={onAssignStudents}
                    className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Assign Students
                  </button>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No students associated with this guardian
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student: any) => (
                      <div
                        key={student.id}
                        className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between"
                      >
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
                            <p className="text-xs text-gray-400">
                              {student.class ? `Class ${student.class}` : ""} •{" "}
                              {student.institute || "N/A"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            onRemoveStudent(guardian.id, student.id)
                          }
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                          title="Remove Student"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
            <button
              onClick={() => onDelete(guardian)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Guardian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===============================
ASSIGN STUDENTS MODAL
=============================== */

interface AssignStudentsModalProps {
  guardianId: string;
  guardianName: string;
  currentStudents: any[];
  onClose: () => void;
  onAssign: (studentIds: string[]) => void;
}

const AssignStudentsModal = ({
  guardianId,
  guardianName,
  currentStudents,
  onClose,
  onAssign,
}: AssignStudentsModalProps) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // This would normally fetch available students from an API
  // For now, using mock data
  const availableStudents = [
    {
      id: "1",
      name: "Rohan Kumar",
      class: "12",
      institute: "Delhi Public School",
    },
    {
      id: "2",
      name: "Ishita Patel",
      class: "11",
      institute: "St. Xavier's School",
    },
    {
      id: "3",
      name: "Aditya Singh",
      class: "12",
      institute: "City Montessori School",
    },
    {
      id: "4",
      name: "Ananya Desai",
      class: "11",
      institute: "Pune International School",
    },
    {
      id: "5",
      name: "Vikram Singh",
      class: "12",
      institute: "Maharaja School",
    },
  ].filter((s) => !currentStudents.some((cs) => cs.id === s.id));

  const filteredStudents = availableStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.institute.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const handleSubmit = () => {
    onAssign(selectedStudents);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Assign Students to {guardianName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar mb-4">
            {filteredStudents.length > 0 ? (
              <>
                <div className="flex items-center gap-2 p-2 border-b border-white/10">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudents.length === filteredStudents.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-300">Select All</span>
                </div>
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => {
                        if (selectedStudents.includes(student.id)) {
                          setSelectedStudents(
                            selectedStudents.filter((id) => id !== student.id),
                          );
                        } else {
                          setSelectedStudents([
                            ...selectedStudents,
                            student.id,
                          ]);
                        }
                      }}
                      className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-pink-500"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-xs text-gray-400">
                        Class {student.class} • {student.institute}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No available students found
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedStudents.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50"
            >
              Assign {selectedStudents.length} Student
              {selectedStudents.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
