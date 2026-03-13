// src/app/dashboard/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} from "@/store/api/userManagementApi";
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
  MoreVertical,
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
  User,
} from "lucide-react";
import Swal from "sweetalert2";

// Types
interface User {
  id: string;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  role:
    | "SUPER_ADMIN"
    | "ADMIN"
    | "TEACHER"
    | "STUDENT"
    | "GUARDIAN"
    | "MODERATOR";
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string | null;
  name?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: any;
  student?: any;
  guardian?: any;
  moderator?: any;
  admin?: any;
}

interface FilterState {
  role: string;
  isActive: string;
  search: string;
  dateRange: string;
}

const UserManagementPage = () => {
  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    role: "",
    isActive: "",
    search: "",
    dateRange: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: true,
    account: true,
    role: true,
  });

  // Queries
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page,
    limit,
    role: filters.role
      ? filters.role.includes(",")
        ? filters.role.split(",")
        : filters.role
      : undefined,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    search: filters.search || undefined,
  });

  // Get single user details when selected
  const {
    data: singleUserData,
    isLoading: isLoadingSingleUser,
    refetch: refetchSingleUser,
  } = useGetUserByIdQuery(selectedUser?.id || "", {
    skip: !selectedUser?.id,
  });

  // Mutations
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleUserStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();

  // Handlers
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`,
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
        await deleteUser(user.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "User has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedUser?.id === user.id) {
          setSelectedUser(null);
          setIsViewModalOpen(false);
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete user.",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleToggleStatus = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const newStatus = !user.isActive;
    const result = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} User?`,
      text: `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${user.name || user.email}?`,
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
        await toggleUserStatus({ id: user.id, isActive: newStatus }).unwrap();
        Swal.fire({
          title: "Success!",
          text: `User has been ${newStatus ? "activated" : "deactivated"} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedUser?.id === user.id) {
          refetchSingleUser();
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to update user status.",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleViewDetails = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    handleRowClick(user);
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "TEACHER":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "STUDENT":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "GUARDIAN":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "MODERATOR":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      case "TEACHER":
        return <GraduationCap className="w-4 h-4" />;
      case "STUDENT":
        return <BookOpen className="w-4 h-4" />;
      case "GUARDIAN":
        return <Heart className="w-4 h-4" />;
      case "MODERATOR":
        return <Activity className="w-4 h-4" />;
      default:
        return <UsersIcon className="w-4 h-4" />;
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "TEACHER":
        return "Teacher";
      case "STUDENT":
        return "Student";
      case "GUARDIAN":
        return "Guardian";
      case "MODERATOR":
        return "Moderator";
      default:
        return role;
    }
  };

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

  // Format date without time
  const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate age from date of birth
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          User Management
        </h1>
        <p className="text-gray-400">
          Click on any user row to view detailed information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Total Users</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {usersData?.meta?.total || 0}
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Active Users</h3>
            <UserCheck className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {usersData?.data?.filter((u: { isActive: any }) => u.isActive)
              .length || 0}
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Teachers</h3>
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {usersData?.data?.filter(
              (u: { role: string }) => u.role === "TEACHER",
            ).length || 0}
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Students</h3>
            <BookOpen className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {usersData?.data?.filter(
              (u: { role: string }) => u.role === "STUDENT",
            ).length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-gray-300 font-medium flex items-center gap-2 hover:bg-gray-700 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => refetchUsers()}
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
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.isActive}
                  onChange={(e) =>
                    setFilters({ ...filters, isActive: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : usersError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load users</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      User
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Contact
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Role
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Joined
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Last Login
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.data?.map((user: User) => (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name?.charAt(0) ||
                                user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">{user.phone}</p>
                        {user.city && (
                          <p className="text-xs text-gray-500">
                            {user.city}, {user.state}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}
                        >
                          {getRoleIcon(user.role)}
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {user.isActive ? (
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
                            {formatDateShort(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {user.lastLogin
                              ? formatDateShort(user.lastLogin)
                              : "Never"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleViewDetails(user, e)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => handleToggleStatus(user, e)}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${
                              user.isActive
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDeleteUser(user, e)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-400"
                            title="Delete"
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
            {usersData?.meta && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Showing {(usersData.meta.page - 1) * usersData.meta.limit + 1}{" "}
                  to{" "}
                  {Math.min(
                    usersData.meta.page * usersData.meta.limit,
                    usersData.meta.total,
                  )}{" "}
                  of {usersData.meta.total} users
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
                    Page {usersData.meta.page} of {usersData.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!usersData.meta.hasNextPage}
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

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  p-4 bg-black/60">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {isLoadingSingleUser ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-white/10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-3xl font-medium text-white">
                      {(
                        singleUserData?.name ||
                        selectedUser.name ||
                        selectedUser.email
                      )
                        ?.charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">
                      {singleUserData?.name || selectedUser.name || "N/A"}
                    </h3>
                    <p className="text-gray-400">
                      {singleUserData?.email || selectedUser.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(singleUserData?.role || selectedUser.role)}`}
                      >
                        {getRoleIcon(singleUserData?.role || selectedUser.role)}
                        {getRoleDisplayName(
                          singleUserData?.role || selectedUser.role,
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          (singleUserData?.isActive ?? selectedUser.isActive)
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {(singleUserData?.isActive ?? selectedUser.isActive) ? (
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
                      {(singleUserData?.emailVerified ??
                        selectedUser.emailVerified) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Email Verified
                        </span>
                      )}
                      {(singleUserData?.phoneVerified ??
                        selectedUser.phoneVerified) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Phone Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="border border-white/10 rounded-xl overflow-hidden no-scrollbar">
                  <button
                    onClick={() => toggleSection("personal")}
                    className="w-full px-6 py-4 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      <h4 className="font-medium text-white">
                        Personal Information
                      </h4>
                    </div>
                    {expandedSections.personal ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.personal && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                        <p className="text-white">
                          {singleUserData?.name || selectedUser.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Gender</p>
                        <p className="text-white">
                          {singleUserData?.gender ||
                            selectedUser.gender ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Date of Birth
                        </p>
                        <p className="text-white">
                          {singleUserData?.dateOfBirth ||
                          selectedUser.dateOfBirth
                            ? `${formatDateShort(singleUserData?.dateOfBirth || selectedUser.dateOfBirth)} (${calculateAge(singleUserData?.dateOfBirth || selectedUser.dateOfBirth)} years)`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Bio</p>
                        <p className="text-white">
                          {singleUserData?.bio ||
                            selectedUser.bio ||
                            "No bio provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information Section */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("contact")}
                    className="w-full px-6 py-4 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-400" />
                      <h4 className="font-medium text-white">
                        Contact Information
                      </h4>
                    </div>
                    {expandedSections.contact ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.contact && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Email Address
                        </p>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <p className="text-white">
                            {singleUserData?.email || selectedUser.email}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Phone Number
                        </p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-400" />
                          <p className="text-white">
                            {singleUserData?.phone || selectedUser.phone}
                          </p>
                        </div>
                      </div>
                      {singleUserData?.alternatePhone ||
                      selectedUser.alternatePhone ? (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Alternate Phone
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-yellow-400" />
                            <p className="text-white">
                              {singleUserData?.alternatePhone ||
                                selectedUser.alternatePhone}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                          <p className="text-white">
                            {singleUserData?.address || selectedUser.address
                              ? `${singleUserData?.address || selectedUser.address}${
                                  singleUserData?.city || selectedUser.city
                                    ? `, ${singleUserData?.city || selectedUser.city}`
                                    : ""
                                }${
                                  singleUserData?.state || selectedUser.state
                                    ? `, ${singleUserData?.state || selectedUser.state}`
                                    : ""
                                }${
                                  singleUserData?.pincode ||
                                  selectedUser.pincode
                                    ? ` - ${singleUserData?.pincode || selectedUser.pincode}`
                                    : ""
                                }`
                              : "No address provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Information Section */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("account")}
                    className="w-full px-6 py-4 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      <h4 className="font-medium text-white">
                        Account Information
                      </h4>
                    </div>
                    {expandedSections.account ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.account && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">User ID</p>
                        <p className="text-white text-sm font-mono">
                          {singleUserData?.id || selectedUser.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Joined Date
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <p className="text-white">
                            {formatDate(
                              singleUserData?.createdAt ||
                                selectedUser.createdAt,
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Login</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <p className="text-white">
                            {singleUserData?.lastLogin || selectedUser.lastLogin
                              ? formatDate(
                                  singleUserData?.lastLogin ||
                                    selectedUser.lastLogin,
                                )
                              : "Never"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Login Attempts
                        </p>
                        <p className="text-white">
                          {singleUserData?.loginAttempts ||
                            selectedUser.loginAttempts ||
                            0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Two Factor Auth
                        </p>
                        <p className="text-white">
                          {singleUserData?.twoFactorEnabled ||
                          selectedUser.twoFactorEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Account Locked
                        </p>
                        <p className="text-white">
                          {singleUserData?.lockedUntil ||
                          selectedUser.lockedUntil
                            ? `Locked until ${formatDate(singleUserData?.lockedUntil || selectedUser.lockedUntil)}`
                            : "No"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role-Specific Information */}
                {(singleUserData?.teacher || selectedUser.teacher) && (
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("role")}
                      className="w-full px-6 py-4 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        <h4 className="font-medium text-white">
                          Teacher Details
                        </h4>
                      </div>
                      {expandedSections.role ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {expandedSections.role && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Qualification
                          </p>
                          <p className="text-white">
                            {singleUserData?.teacher?.qualification ||
                              selectedUser.teacher?.qualification ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Experience
                          </p>
                          <p className="text-white">
                            {singleUserData?.teacher?.experience ||
                              selectedUser.teacher?.experience ||
                              0}{" "}
                            years
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Institute
                          </p>
                          <p className="text-white">
                            {singleUserData?.teacher?.institute ||
                              selectedUser.teacher?.institute ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Expertise
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(
                              singleUserData?.teacher?.expertise ||
                              selectedUser.teacher?.expertise ||
                              []
                            ).map((exp: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Student Details */}
                {(singleUserData?.student || selectedUser.student) && (
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("role")}
                      className="w-full px-6 py-4 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-green-400" />
                        <h4 className="font-medium text-white">
                          Student Details
                        </h4>
                      </div>
                      {expandedSections.role ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {expandedSections.role && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Institute
                          </p>
                          <p className="text-white">
                            {singleUserData?.student?.institute ||
                              selectedUser.student?.institute ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Class</p>
                          <p className="text-white">
                            {singleUserData?.student?.class ||
                              selectedUser.student?.class ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Board</p>
                          <p className="text-white">
                            {singleUserData?.student?.board ||
                              selectedUser.student?.board ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Education Level
                          </p>
                          <p className="text-white">
                            {singleUserData?.student?.educationLevel ||
                              selectedUser.student?.educationLevel ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={(e) =>
                      handleToggleStatus(
                        { ...selectedUser, ...singleUserData } as User,
                        e,
                      )
                    }
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      (singleUserData?.isActive ?? selectedUser.isActive)
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {(singleUserData?.isActive ?? selectedUser.isActive) ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Deactivate User
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Activate User
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      // Open edit modal
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
