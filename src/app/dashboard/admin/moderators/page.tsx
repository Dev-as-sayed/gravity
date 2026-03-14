// src/app/dashboard/admin/moderators/page.tsx
"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Shield,
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
  Users,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Settings,
  Star,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  Hash,
  Award,
  BarChart,
} from "lucide-react";

import {
  useGetModeratorsQuery,
  useGetModeratorByIdQuery,
  useGetModeratorStatsQuery,
  useGetModeratorBatchesQuery,
  useGetModeratorActivityQuery,
  useCreateModeratorMutation,
  useUpdateModeratorMutation,
  useDeleteModeratorMutation,
  useToggleModeratorStatusMutation,
  useBulkModeratorActionMutation,
  useAssignBatchesToModeratorMutation,
  useRemoveBatchesFromModeratorMutation,
} from "@/store/api/moderatorApi";

// Types
interface Moderator {
  id: string;
  name: string;
  assignedBy: string;
  permissions: any;
  lastActive?: string | null;
  actionsTaken: number;
  resolvedIssues: number;
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
    profileImage?: string | null;
  }; // Make user required, not optional
  assigner?: {
    type: "TEACHER" | "ADMIN";
    id: string;
    name: string;
    email?: string;
  } | null;
  batches?: Array<{
    id: string;
    name: string;
    subject: string;
    mode: string;
    teacher?: {
      name: string;
    };
  }>;
  _count?: {
    batches: number;
  };
}

interface Filters {
  search: string;
  isActive: string;
  hasBatches: string;
  assignedBy: string;
}

interface ModeratorFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  alternatePhone?: string;
  permissions?: any;
  assignedBy?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profileImage?: string;
}

const ModeratorManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedModerators, setSelectedModerators] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [assignBatchesModal, setAssignBatchesModal] = useState(false);
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(
    null,
  );
  const [filters, setFilters] = useState<Filters>({
    search: "",
    isActive: "",
    hasBatches: "",
    assignedBy: "",
  });

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: moderatorsData,
    isLoading,
    error,
    refetch,
  } = useGetModeratorsQuery({
    page,
    limit,
    search: filters.search || undefined,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    hasBatches: filters.hasBatches ? filters.hasBatches === "true" : undefined,
    assignedBy: filters.assignedBy || undefined,
  }) as {
    data?: {
      data: Moderator[];
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

  const { data: stats, refetch: refetchStats } = useGetModeratorStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singleModeratorData, refetch: refetchModerator } =
    useGetModeratorByIdQuery(selectedModerator?.id || "", {
      skip: !selectedModerator?.id,
    });

  const { data: moderatorBatches, refetch: refetchBatches } =
    useGetModeratorBatchesQuery(selectedModerator?.id || "", {
      skip: !selectedModerator?.id,
    });

  const { data: moderatorActivity } = useGetModeratorActivityQuery(
    selectedModerator?.id || "",
    { skip: !selectedModerator?.id },
  );

  const moderators = moderatorsData?.data || [];
  const meta = moderatorsData?.meta;

  /* ===============================
  MUTATIONS
  =============================== */

  const [createModerator, { isLoading: isCreating }] =
    useCreateModeratorMutation();
  const [updateModerator, { isLoading: isUpdating }] =
    useUpdateModeratorMutation();
  const [deleteModerator, { isLoading: isDeleting }] =
    useDeleteModeratorMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleModeratorStatusMutation();
  const [bulkAction, { isLoading: isBulkAction }] =
    useBulkModeratorActionMutation();
  const [assignBatches, { isLoading: isAssigning }] =
    useAssignBatchesToModeratorMutation();
  const [removeBatches] = useRemoveBatchesFromModeratorMutation();

  /* ===============================
  ACTIONS
  =============================== */

  const handleDelete = async (moderator: Moderator) => {
    const result = await Swal.fire({
      title: "Delete Moderator?",
      text: `Are you sure you want to delete ${moderator.name}? This action cannot be undone.`,
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
        await deleteModerator(moderator.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Moderator has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedModerator?.id === moderator.id) {
          setSelectedModerator(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete moderator",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleToggle = async (moderator: Moderator) => {
    const newStatus = !moderator.user.isActive;
    const result = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} Moderator?`,
      text: `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${moderator.name}?`,
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
          id: moderator.id,
          isActive: newStatus,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `Moderator has been ${newStatus ? "activated" : "deactivated"} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedModerator?.id === moderator.id) {
          refetchModerator();
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
    if (!selectedModerators.length) {
      Swal.fire({
        title: "No moderators selected",
        text: "Please select at least one moderator",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}d`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedModerators.length} moderators?`,
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
          moderatorIds: selectedModerators,
          action,
        }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${selectedModerators.length} moderators ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedModerators([]);
        setSelectAll(false);
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} moderators`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleSelect = (id: string) => {
    if (selectedModerators.includes(id)) {
      setSelectedModerators(selectedModerators.filter((s) => s !== id));
    } else {
      setSelectedModerators([...selectedModerators, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedModerators([]);
    } else {
      setSelectedModerators(moderators.map((m) => m.id));
    }
    setSelectAll(!selectAll);
  };

  const handleView = (moderator: Moderator) => {
    setSelectedModerator(moderator);
    setViewModal(true);
  };

  const handleEdit = (moderator: Moderator) => {
    setSelectedModerator(moderator);
    setEditModal(true);
  };

  const handleAssignBatches = (moderator: Moderator) => {
    setSelectedModerator(moderator);
    setAssignBatchesModal(true);
  };

  const handleCreate = async (formData: ModeratorFormData) => {
    try {
      await createModerator(formData).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Moderator created successfully",
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
        text: err.data?.message || "Failed to create moderator",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (id: string, formData: ModeratorFormData) => {
    try {
      await updateModerator({ id, data: formData }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Moderator updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedModerator(null);
      refetch();
      refetchStats();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to update moderator",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleAssignBatchesSubmit = async (batchIds: string[]) => {
    if (!selectedModerator) return;

    try {
      await assignBatches({
        moderatorId: selectedModerator.id,
        batchIds,
      }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Batches assigned successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      refetchBatches();
      setAssignBatchesModal(false);
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to assign batches",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleRemoveBatch = async (batchId: string) => {
    if (!selectedModerator) return;

    const result = await Swal.fire({
      title: "Remove Batch?",
      text: "Are you sure you want to remove this batch from the moderator?",
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
        await removeBatches({
          moderatorId: selectedModerator.id,
          batchIds: [batchId],
        }).unwrap();
        Swal.fire({
          title: "Removed!",
          text: "Batch removed successfully",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        refetchBatches();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to remove batch",
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
      hasBatches: "",
      assignedBy: "",
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

  // Get assigner display name
  const getAssignerDisplay = (moderator: Moderator) => {
    if (moderator.assigner) {
      return `${moderator.assigner.name} (${moderator.assigner.type})`;
    }
    return moderator.assignedBy || "System";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          Moderator Management
        </h1>
        <p className="text-gray-400">
          Manage all moderators across the platform
        </p>
      </div>

      {/* ===============================
      STATS CARDS
      =============================== */}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Moderators</h3>
              <Shield className="w-5 h-5 text-blue-400" />
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
              <h3 className="text-gray-400 text-sm">With Batches</h3>
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.withBatches || 0}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Actions Taken</h3>
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.topModerators?.[0]?.actionsTaken || 0}
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
              Add Moderator
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
              placeholder="Search moderators..."
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
                  Batches
                </label>
                <select
                  value={filters.hasBatches}
                  onChange={(e) => {
                    setFilters({ ...filters, hasBatches: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="true">Has Batches</option>
                  <option value="false">No Batches</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned By
                </label>
                <select
                  value={filters.assignedBy}
                  onChange={(e) => {
                    setFilters({ ...filters, assignedBy: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
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

      {selectedModerators.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedModerators.length}</span>{" "}
            moderators selected
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
      MODERATORS TABLE
      =============================== */}

      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load moderators</p>
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
                        checked={selectAll && moderators.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Moderator
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Contact
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Assigned By
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Batches
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Resolved
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
                  {moderators.map((moderator: Moderator) => (
                    <tr
                      key={moderator.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleView(moderator)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedModerators.includes(moderator.id)}
                          onChange={() => handleSelect(moderator.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {moderator.name?.charAt(0) || "M"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {moderator.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-white text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            {moderator.user?.email || "N/A"}
                          </p>
                          <p className="text-white text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {moderator.user?.phone || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          {getAssignerDisplay(moderator)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm">
                            {moderator._count?.batches || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">
                            {moderator.actionsTaken || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm">
                            {moderator.resolvedIssues || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            moderator.user?.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {moderator.user?.isActive ? (
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
                            {formatDate(moderator.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(moderator);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(moderator);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignBatches(moderator);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Assign Batches"
                          >
                            <Layers className="w-4 h-4 text-purple-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(moderator);
                            }}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${
                              moderator.user?.isActive
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                            title={
                              moderator.user?.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            disabled={isToggling}
                          >
                            {moderator.user?.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(moderator);
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
                  moderators
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

      {/* Add/Edit Moderator Modal */}
      {(openModal || editModal) && (
        <ModeratorModal
          mode={openModal ? "create" : "edit"}
          moderator={editModal ? selectedModerator : undefined}
          onClose={() => {
            setOpenModal(false);
            setEditModal(false);
            setSelectedModerator(null);
          }}
          onSubmit={
            openModal
              ? handleCreate
              : (data) => handleUpdate(selectedModerator!.id, data)
          }
          isLoading={openModal ? isCreating : isUpdating}
        />
      )}

      {/* View Moderator Modal */}
      {viewModal && selectedModerator && (
        <ModeratorViewModal
          moderator={singleModeratorData || selectedModerator}
          batches={moderatorBatches || []}
          activity={moderatorActivity?.data}
          onClose={() => {
            setViewModal(false);
            setSelectedModerator(null);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAssignBatches={() => {
            setViewModal(false);
            setAssignBatchesModal(true);
          }}
          onRemoveBatch={handleRemoveBatch}
        />
      )}

      {/* Assign Batches Modal */}
      {assignBatchesModal && selectedModerator && (
        <AssignBatchesModal
          moderatorId={selectedModerator.id}
          moderatorName={selectedModerator.name}
          currentBatches={moderatorBatches || []}
          onClose={() => {
            setAssignBatchesModal(false);
            setSelectedModerator(null);
          }}
          onAssign={handleAssignBatchesSubmit}
          isLoading={isAssigning}
        />
      )}
    </div>
  );
};

export default ModeratorManagement;

/* ===============================
MODERATOR MODAL (Create/Edit)
=============================== */

interface ModeratorModalProps {
  mode: "create" | "edit";
  moderator?: Moderator | null;
  onClose: () => void;
  onSubmit: (data: ModeratorFormData) => void;
  isLoading?: boolean;
}

const ModeratorModal = ({
  mode,
  moderator,
  onClose,
  onSubmit,
  isLoading,
}: ModeratorModalProps) => {
  const [form, setForm] = useState<ModeratorFormData>({
    name: moderator?.name || "",
    email: moderator?.user?.email || "",
    phone: moderator?.user?.phone || "",
    password: "",
    alternatePhone: moderator?.user?.alternatePhone || "",
    permissions: moderator?.permissions || {
      canManagePosts: true,
      canModerateComments: true,
    },
    assignedBy: moderator?.assignedBy || "",
    isActive: moderator?.user?.isActive ?? true,
    emailVerified: moderator?.user?.emailVerified ?? false,
    phoneVerified: moderator?.user?.phoneVerified ?? false,
    profileImage: moderator?.user?.profileImage || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

  const handlePermissionChange = (permission: string) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [permission]: !form.permissions?.[permission],
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Add New Moderator" : "Edit Moderator"}
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
                  placeholder="moderator@example.com"
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
                  Assigned By (ID)
                </label>
                <input
                  name="assignedBy"
                  value={form.assignedBy}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Teacher or Admin ID"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.permissions?.canManagePosts || false}
                  onChange={() => handlePermissionChange("canManagePosts")}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Manage Posts</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.permissions?.canModerateComments || false}
                  onChange={() => handlePermissionChange("canModerateComments")}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Moderate Comments</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.permissions?.canManageBatches || false}
                  onChange={() => handlePermissionChange("canManageBatches")}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Manage Batches</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.permissions?.canResolveDoubts || false}
                  onChange={() => handlePermissionChange("canResolveDoubts")}
                  className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Resolve Doubts</span>
              </label>
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
              {mode === "create" ? "Create Moderator" : "Update Moderator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===============================
MODERATOR VIEW MODAL
=============================== */

interface ModeratorViewModalProps {
  moderator: any;
  batches: any[];
  activity?: any;
  onClose: () => void;
  onEdit: () => void;
  onToggle: (moderator: any) => void;
  onDelete: (moderator: any) => void;
  onAssignBatches: () => void;
  onRemoveBatch: (batchId: string) => void;
}

const ModeratorViewModal = ({
  moderator,
  batches,
  activity,
  onClose,
  onEdit,
  onToggle,
  onDelete,
  onAssignBatches,
  onRemoveBatch,
}: ModeratorViewModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "batches" | "activity"
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

  // Get assigner display
  const getAssignerDisplay = () => {
    if (moderator.assigner) {
      return `${moderator.assigner.name} (${moderator.assigner.type})`;
    }
    return moderator.assignedBy || "System";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Moderator Details
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
                {moderator.name?.charAt(0) || "M"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">
                {moderator.name}
              </h3>
              <p className="text-gray-400">
                Moderator • Assigned by: {getAssignerDisplay()}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    moderator.user?.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {moderator.user?.isActive ? "Active" : "Inactive"}
                </span>
                {moderator.user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Email Verified
                  </span>
                )}
                {moderator.user?.phoneVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Phone Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onToggle(moderator)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  moderator.user?.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {moderator.user?.isActive ? (
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
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("batches")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "batches"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Assigned Batches ({batches.length})
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "activity"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-white">{moderator.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-white">{moderator.user?.phone}</p>
                      </div>
                      {moderator.user?.alternatePhone && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Alternate Phone
                          </p>
                          <p className="text-white">
                            {moderator.user.alternatePhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">
                      Performance Metrics
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Actions Taken</p>
                        <p className="text-white text-lg font-bold">
                          {moderator.actionsTaken || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Issues Resolved</p>
                        <p className="text-white text-lg font-bold">
                          {moderator.resolvedIssues || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resolution Rate</p>
                        <p className="text-white text-lg font-bold">
                          {moderator.actionsTaken > 0
                            ? Math.round(
                                (moderator.resolvedIssues /
                                  moderator.actionsTaken) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="font-medium text-white mb-3">Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(moderator.permissions || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          {value ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-300">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h4 className="font-medium text-white mb-3">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Last Active</p>
                      <p className="text-white">
                        {moderator.lastActive
                          ? formatDate(moderator.lastActive)
                          : "Never"}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Last Login</p>
                      <p className="text-white">
                        {moderator.user?.lastLogin
                          ? formatDate(moderator.user.lastLogin)
                          : "Never"}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Joined Date</p>
                      <p className="text-white">
                        {formatDate(moderator.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "batches" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-white">Assigned Batches</h4>
                  <button
                    onClick={onAssignBatches}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Assign Batches
                  </button>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                {activity ? (
                  <div className="space-y-6">
                    {/* Activity Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {activity.activitySummary?.totalActions || 0}
                        </p>
                        <p className="text-xs text-gray-500">Total Actions</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {activity.activitySummary?.totalResolved || 0}
                        </p>
                        <p className="text-xs text-gray-500">Resolved Issues</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">
                          {activity.activitySummary?.resolutionRate || 0}%
                        </p>
                        <p className="text-xs text-gray-500">Resolution Rate</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-medium text-white mb-3">
                        Recent Activity
                      </h4>
                      {activity.recentActivity?.length > 0 ? (
                        <div className="space-y-2">
                          {activity.recentActivity.map(
                            (act: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-800/50 rounded-lg p-3"
                              >
                                <p className="text-white text-sm">
                                  {act.action}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(act.createdAt)}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No activity data available
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
              onClick={() => onDelete(moderator)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Moderator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===============================
ASSIGN BATCHES MODAL
=============================== */

interface AssignBatchesModalProps {
  moderatorId: string;
  moderatorName: string;
  currentBatches: any[];
  onClose: () => void;
  onAssign: (batchIds: string[]) => void;
  isLoading?: boolean;
}

const AssignBatchesModal = ({
  moderatorId,
  moderatorName,
  currentBatches,
  onClose,
  onAssign,
  isLoading,
}: AssignBatchesModalProps) => {
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Mock available batches - replace with actual API call
  const availableBatches = [
    {
      id: "1",
      name: "Quantum Physics Batch 2024",
      subject: "Physics",
      mode: "ONLINE",
      teacher: "Dr. Arjun Sharma",
    },
    {
      id: "2",
      name: "Electromagnetism Advanced",
      subject: "Physics",
      mode: "ONLINE",
      teacher: "Prof. Neha Gupta",
    },
    {
      id: "3",
      name: "Relativity Crash Course",
      subject: "Physics",
      mode: "HYBRID",
      teacher: "Dr. Rahul Verma",
    },
    {
      id: "4",
      name: "Classical Mechanics Foundation",
      subject: "Physics",
      mode: "OFFLINE",
      teacher: "Prof. Priya Singh",
    },
    {
      id: "5",
      name: "Quantum Mechanics Advanced",
      subject: "Physics",
      mode: "ONLINE",
      teacher: "Dr. Arjun Sharma",
    },
  ].filter((b) => !currentBatches.some((cb) => cb.id === b.id));

  const filteredBatches = availableBatches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.subject.toLowerCase().includes(search.toLowerCase()) ||
      b.teacher.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectAll = () => {
    if (selectedBatches.length === filteredBatches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(filteredBatches.map((b) => b.id));
    }
  };

  const handleSubmit = () => {
    onAssign(selectedBatches);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Assign Batches to {moderatorName}
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
                placeholder="Search batches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Batch List */}
          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {filteredBatches.length > 0 ? (
              <>
                <div className="flex items-center gap-2 p-2 border-b border-white/10">
                  <input
                    type="checkbox"
                    checked={selectedBatches.length === filteredBatches.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Select All</span>
                </div>
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBatches.includes(batch.id)}
                      onChange={() => {
                        if (selectedBatches.includes(batch.id)) {
                          setSelectedBatches(
                            selectedBatches.filter((id) => id !== batch.id),
                          );
                        } else {
                          setSelectedBatches([...selectedBatches, batch.id]);
                        }
                      }}
                      className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{batch.name}</p>
                      <p className="text-xs text-gray-400">
                        {batch.subject} • {batch.mode} • {batch.teacher}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No available batches found
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
              disabled={selectedBatches.length === 0 || isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Assign ${selectedBatches.length} Batch${selectedBatches.length !== 1 ? "es" : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
