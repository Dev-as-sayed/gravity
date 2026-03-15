// src/app/dashboard/admin/payments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  DollarSign,
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
  CreditCard,
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
  Calendar,
  Globe,
  Lock,
  EyeOff,
  Wallet,
  Banknote,
  Receipt,
  ReceiptText,
  ReceiptIcon,
  Landmark,
  Building,
  Smartphone,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  AlertTriangle,
  Check,
  X as XIcon,
} from "lucide-react";

import {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentStatsQuery,
  useGetPaymentReceiptQuery,
  useGetStudentPaymentsQuery,
  useGetEnrollmentPaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useVerifyPaymentMutation,
  useRefundPaymentMutation,
  useFailPaymentMutation,
  useSendPaymentRemindersMutation,
  useGenerateInvoiceMutation,
  useBulkVerifyPaymentsMutation,
  useBulkDeletePaymentsMutation,
  PaymentReceipt,
} from "@/store/api/paymentApi";
import { useGetStudentsQuery } from "@/store/api/studentApi";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";

// Types
interface Payment {
  id: string;
  enrollmentId: string;
  studentId: string;
  amount: number;
  paidAmount: number;
  dueAmount?: number | null;
  tax?: number | null;
  totalAmount?: number | null;
  method: string;
  status: string;
  transactionId?: string | null;
  paymentGateway?: string | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  upiId?: string | null;
  bankName?: string | null;
  manualReference?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  paymentDate: string;
  dueDate?: string | null;
  receiptUrl?: string | null;
  invoiceNumber?: string | null;
  remindersSent: number;
  lastReminderSent?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  refundedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    email: string;
    phone: string;
    class?: string | null;
  };
  enrollment?: {
    id: string;
    batchId: string;
    batch: {
      id: string;
      name: string;
      subject: string;
    };
    totalFees: number;
    paidAmount: number;
    dueAmount: number;
  };
}

interface Filters {
  search: string;
  status: string;
  method: string;
  studentId: string;
  enrollmentId: string;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;
}

const PaymentManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    method: "",
    studentId: "",
    enrollmentId: "",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [verifyNotes, setVerifyNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");
  const [refundId, setRefundId] = useState("");

  /* ===============================
  FETCH DATA
  =============================== */

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useGetPaymentsQuery({
    page,
    limit,
    status: filters.status || undefined,
    method: filters.method || undefined,
    studentId: filters.studentId || undefined,
    enrollmentId: filters.enrollmentId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
    maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
  });

  const { data: stats, refetch: refetchStats } = useGetPaymentStatsQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const { data: singlePayment, refetch: refetchPayment } =
    useGetPaymentByIdQuery(selectedPayment?.id || "", {
      skip: !selectedPayment?.id,
    });

  const { data: paymentReceipt, refetch: refetchReceipt } =
    useGetPaymentReceiptQuery(selectedPayment?.id || "", {
      skip: !selectedPayment?.id,
    });

  const { data: studentsData } = useGetStudentsQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const { data: enrollmentsData } = useGetEnrollmentsQuery({
    page: 1,
    limit: 100,
  });

  const payments = paymentsData?.data || [];
  const meta = paymentsData?.meta;
  const students = studentsData?.data || [];
  const enrollments = enrollmentsData?.data || [];

  /* ===============================
  MUTATIONS
  =============================== */

  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();
  const [verifyPayment, { isLoading: isVerifying }] =
    useVerifyPaymentMutation();
  const [refundPayment, { isLoading: isRefunding }] =
    useRefundPaymentMutation();
  const [failPayment, { isLoading: isFailing }] = useFailPaymentMutation();
  const [sendReminders, { isLoading: isSending }] =
    useSendPaymentRemindersMutation();
  const [generateInvoice] = useGenerateInvoiceMutation();
  const [bulkVerify, { isLoading: isBulkVerifying }] =
    useBulkVerifyPaymentsMutation();
  const [bulkDelete, { isLoading: isBulkDeleting }] =
    useBulkDeletePaymentsMutation();

  /* ===============================
  EFFECTS
  =============================== */

  useEffect(() => {
    if (singlePayment && viewModal) {
      setIsDataLoaded(true);
    }
  }, [singlePayment, viewModal]);

  useEffect(() => {
    if (selectedPayment) {
      setRefundAmount(selectedPayment.amount);
    }
  }, [selectedPayment]);

  /* ===============================
  HANDLERS
  =============================== */

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDataLoaded(false);
    setViewModal(true);
  };

  const handleDelete = async (payment: Payment) => {
    const result = await Swal.fire({
      title: "Delete Payment?",
      text: `Are you sure you want to delete payment #${payment.invoiceNumber}? This action cannot be undone.`,
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
        await deletePayment(payment.id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Payment has been deleted successfully.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        if (selectedPayment?.id === payment.id) {
          setSelectedPayment(null);
          setViewModal(false);
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || "Failed to delete payment",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleVerify = async (approve: boolean) => {
    if (!selectedPayment) return;

    try {
      await verifyPayment({
        id: selectedPayment.id,
        data: { approve, notes: verifyNotes },
      }).unwrap();
      Swal.fire({
        title: approve ? "Verified!" : "Rejected!",
        text: approve
          ? "Payment has been verified successfully."
          : "Payment has been rejected.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setVerifyModal(false);
      setVerifyNotes("");
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to verify payment",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    try {
      await refundPayment({
        id: selectedPayment.id,
        data: {
          amount: refundAmount,
          reason: refundReason,
          refundId: refundId || undefined,
        },
      }).unwrap();
      Swal.fire({
        title: "Refunded!",
        text: "Payment has been refunded successfully.",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setRefundModal(false);
      setRefundReason("");
      setRefundId("");
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to refund payment",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSendReminders = async () => {
    try {
      const result = await sendReminders({ daysBefore: 7 }).unwrap();
      Swal.fire({
        title: "Reminders Sent!",
        text: `Sent ${result.data.length} payment reminders.`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to send reminders",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const result = await generateInvoice().unwrap();
      Swal.fire({
        title: "Invoice Generated!",
        text: `Invoice Number: ${result.data.invoiceNumber}`,
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to generate invoice",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleBulkAction = async (action: "verify" | "reject" | "delete") => {
    if (!selectedPayments.length) {
      Swal.fire({
        title: "No payments selected",
        text: "Please select at least one payment",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const actionText = action === "delete" ? "deleted" : `${action}ed`;
    const result = await Swal.fire({
      title: `Bulk ${action}?`,
      text: `Are you sure you want to ${action} ${selectedPayments.length} payments?`,
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
        if (action === "verify" || action === "reject") {
          await bulkVerify({
            paymentIds: selectedPayments,
            approve: action === "verify",
          }).unwrap();
        } else if (action === "delete") {
          await bulkDelete(selectedPayments).unwrap();
        }
        Swal.fire({
          title: "Success!",
          text: `${selectedPayments.length} payments ${actionText} successfully.`,
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
        });
        setSelectedPayments([]);
        setSelectAll(false);
        refetch();
        refetchStats();
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.data?.message || `Failed to ${action} payments`,
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleCreatePayment = async (data: any) => {
    try {
      await createPayment(data).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Payment created successfully",
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
        text: error.data?.message || "Failed to create payment",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleUpdatePayment = async (id: string, data: any) => {
    try {
      await updatePayment({ id, data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Payment updated successfully",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        timer: 2000,
      });
      setEditModal(false);
      setSelectedPayment(null);
      refetch();
      refetchStats();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.data?.message || "Failed to update payment",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleSelect = (id: string) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter((s) => s !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map((p: Payment) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      method: "",
      studentId: "",
      enrollmentId: "",
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
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

  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "REFUNDED":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "PARTIAL":
        return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
      case "OVERDUE":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "PROCESSING":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-4 h-4" />;
      case "REFUNDED":
        return <RotateCcw className="w-4 h-4" />;
      case "OVERDUE":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  // Get method icon
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "ONLINE":
        return <Globe className="w-4 h-4" />;
      case "CARD":
        return <CreditCard className="w-4 h-4" />;
      case "UPI":
        return <QrCode className="w-4 h-4" />;
      case "NET_BANKING":
        return <Landmark className="w-4 h-4" />;
      case "MANUAL":
        return <FileText className="w-4 h-4" />;
      case "INSTALLMENT":
        return <Wallet className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-blue-400" />
          Payment Management
        </h1>
        <p className="text-gray-400">
          Manage all payments, transactions, and financial records
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(stats.data?.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.data?.total} transactions
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Pending Verification</h3>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.pendingVerification}
            </p>
            <p className="text-xs text-gray-500 mt-1">Manual payments</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Average Payment</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(stats.data?.averagePayment)}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Success Rate</h3>
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.data?.total > 0
                ? Math.round(
                    ((stats.data.byStatus?.find((s) => s.status === "COMPLETED")
                      ?._count || 0) /
                      stats.data.total) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {/* Payment Method Distribution */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-400" />
              Payment Methods
            </h3>
            <div className="space-y-3">
              {stats.data?.byMethod?.map((item) => (
                <div key={item.method} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-28 flex items-center gap-1">
                    {getMethodIcon(item.method)}
                    {item.method}
                  </span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{
                        width: `${(item._count / stats.data.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-20 text-right">
                    {item._count} (₹{item._sum?.amount?.toLocaleString()})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Monthly Revenue
            </h3>
            <div className="space-y-3">
              {stats.data?.monthlyRevenue?.slice(0, 6).map((item) => (
                <div key={item.month} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-24">
                    {new Date(item.month).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full"
                      style={{
                        width: `${(item.revenue / (stats.data?.totalRevenue || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-28 text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
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
              Create Payment
            </button>
            <button
              onClick={handleSendReminders}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-yellow-600 transition-all"
              disabled={isSending}
            >
              <Mail className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Reminders"}
            </button>
            <button
              onClick={() => setBulkActionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              disabled={selectedPayments.length === 0}
            >
              <CreditCard className="w-4 h-4" />
              Bulk Actions ({selectedPayments.length})
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
              placeholder="Search by invoice, transaction ID..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4">
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
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Method
                </label>
                <select
                  value={filters.method}
                  onChange={(e) => {
                    setFilters({ ...filters, method: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  <option value="ONLINE">Online</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="MANUAL">Manual</option>
                  <option value="INSTALLMENT">Installment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student
                </label>
                <select
                  value={filters.studentId}
                  onChange={(e) => {
                    setFilters({ ...filters, studentId: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Students</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enrollment
                </label>
                <select
                  value={filters.enrollmentId}
                  onChange={(e) => {
                    setFilters({ ...filters, enrollmentId: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All</option>
                  {enrollments.map((enrollment: any) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {enrollment.batch?.name} - {enrollment.student?.name}
                    </option>
                  ))}
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Amount
                </label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => {
                    setFilters({ ...filters, minAmount: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Amount
                </label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => {
                    setFilters({ ...filters, maxAmount: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="50000"
                />
              </div>

              <div className="flex items-end col-span-full">
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

      {/* Bulk Actions Bar */}
      {selectedPayments.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <p className="text-blue-400">
            <span className="font-bold">{selectedPayments.length}</span>{" "}
            payments selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("verify")}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center gap-1"
              disabled={isBulkVerifying}
            >
              <CheckCircle className="w-4 h-4" />
              Verify
            </button>
            <button
              onClick={() => handleBulkAction("reject")}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-1"
              disabled={isBulkVerifying}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-1"
              disabled={isBulkDeleting}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400">Failed to load payments</p>
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
                        checked={selectAll && payments.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Invoice
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Student
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Batch
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Amount
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Method
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Date
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: Payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(payment)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => handleSelect(payment.id)}
                          className="w-4 h-4 bg-gray-800 border-white/10 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-mono text-sm">
                            {payment.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {payment.student?.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <span className="text-white text-sm">
                            {payment.student?.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          {payment.enrollment?.batch.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.enrollment?.batch.subject}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        {payment.tax ? (
                          <p className="text-xs text-gray-500">
                            Tax: {formatCurrency(payment.tax)}
                          </p>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {getMethodIcon(payment.method)}
                          <span className="text-white text-sm">
                            {payment.method}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-300">
                            {formatDate(payment.paymentDate)}
                          </span>
                          {payment.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {formatDate(payment.dueDate)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                              setReceiptModal(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <ReceiptText className="w-4 h-4 text-blue-400" />
                          </button>

                          {payment.status === "PENDING" &&
                            payment.method === "MANUAL" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPayment(payment);
                                  setVerifyModal(true);
                                }}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                title="Verify Payment"
                              >
                                <ShieldCheck className="w-4 h-4 text-green-400" />
                              </button>
                            )}

                          {payment.status === "COMPLETED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPayment(payment);
                                setRefundModal(true);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              title="Refund"
                            >
                              <RotateCcw className="w-4 h-4 text-purple-400" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
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
                              handleDelete(payment);
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
                  payments
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
        <PaymentModal
          mode="create"
          students={students}
          enrollments={enrollments}
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreatePayment}
          isLoading={isCreating}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {editModal && selectedPayment && (
        <PaymentModal
          mode="edit"
          payment={selectedPayment}
          students={students}
          enrollments={enrollments}
          onClose={() => {
            setEditModal(false);
            setSelectedPayment(null);
          }}
          onSubmit={(data) => handleUpdatePayment(selectedPayment.id, data)}
          isLoading={isUpdating}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      {viewModal && selectedPayment && (
        <ViewPaymentModal
          payment={singlePayment || selectedPayment}
          isLoading={!isDataLoaded}
          onClose={() => {
            setViewModal(false);
            setSelectedPayment(null);
            setIsDataLoaded(false);
          }}
          onEdit={() => {
            setViewModal(false);
            setEditModal(true);
          }}
          onVerify={() => {
            setViewModal(false);
            setVerifyModal(true);
          }}
          onRefund={() => {
            setViewModal(false);
            setRefundModal(true);
          }}
          onReceipt={() => {
            setViewModal(false);
            setReceiptModal(true);
          }}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      )}

      {receiptModal && selectedPayment && paymentReceipt && (
        <ReceiptModal
          payment={selectedPayment}
          receipt={paymentReceipt.data}
          onClose={() => {
            setReceiptModal(false);
            setSelectedPayment(null);
          }}
          onPrint={() => window.print()}
          onDownload={() => {
            // Implement PDF download
          }}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      )}

      {verifyModal && selectedPayment && (
        <VerifyModal
          payment={selectedPayment}
          onClose={() => {
            setVerifyModal(false);
            setVerifyNotes("");
          }}
          onVerify={handleVerify}
          notes={verifyNotes}
          setNotes={setVerifyNotes}
          isLoading={isVerifying}
        />
      )}

      {refundModal && selectedPayment && (
        <RefundModal
          payment={selectedPayment}
          onClose={() => {
            setRefundModal(false);
            setRefundReason("");
            setRefundId("");
          }}
          onRefund={handleRefund}
          refundAmount={refundAmount}
          setRefundAmount={setRefundAmount}
          refundReason={refundReason}
          setRefundReason={setRefundReason}
          refundId={refundId}
          setRefundId={setRefundId}
          isLoading={isRefunding}
          formatCurrency={formatCurrency}
        />
      )}

      {bulkActionModal && (
        <BulkActionModal
          selectedCount={selectedPayments.length}
          onClose={() => setBulkActionModal(false)}
          onAction={handleBulkAction}
          isLoading={isBulkVerifying || isBulkDeleting}
        />
      )}
    </div>
  );
};

export default PaymentManagement;

// =============================================
// PAYMENT MODAL (Create/Edit)
// =============================================

interface PaymentModalProps {
  mode: "create" | "edit";
  payment?: Payment | null;
  students: any[];
  enrollments: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onGenerateInvoice: () => void;
}

const PaymentModal = ({
  mode,
  payment,
  students,
  enrollments,
  onClose,
  onSubmit,
  isLoading,
  onGenerateInvoice,
}: PaymentModalProps) => {
  const [form, setForm] = useState({
    enrollmentId: payment?.enrollmentId || "",
    studentId: payment?.studentId || "",
    amount: payment?.amount || "",
    paidAmount: payment?.paidAmount || "",
    tax: payment?.tax || "",
    method: payment?.method || "ONLINE",
    status: payment?.status || "PENDING",
    transactionId: payment?.transactionId || "",
    paymentGateway: payment?.paymentGateway || "",
    cardLast4: payment?.cardLast4 || "",
    cardBrand: payment?.cardBrand || "",
    upiId: payment?.upiId || "",
    bankName: payment?.bankName || "",
    manualReference: payment?.manualReference || "",
    paymentDate:
      payment?.paymentDate?.split("T")[0] ||
      new Date().toISOString().split("T")[0],
    dueDate: payment?.dueDate?.split("T")[0] || "",
    receiptUrl: payment?.receiptUrl || "",
    notes: payment?.notes || "",
  });

  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  // Filter enrollments by selected student
  const filteredEnrollments = enrollments.filter(
    (e: any) => e.studentId === form.studentId,
  );

  // Update enrollment details when enrollment changes
  useEffect(() => {
    if (form.enrollmentId) {
      const enrollment = enrollments.find(
        (e: any) => e.id === form.enrollmentId,
      );
      setSelectedEnrollment(enrollment);
    }
  }, [form.enrollmentId, enrollments]);

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
      amount: parseFloat(form.amount.toString()),
      paidAmount: form.paidAmount
        ? parseFloat(form.paidAmount.toString())
        : parseFloat(form.amount.toString()),
      tax: form.tax ? parseFloat(form.tax.toString()) : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Create New Payment" : "Edit Payment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.class || "N/A"}
                </option>
              ))}
            </select>
          </div>

          {/* Enrollment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enrollment *
            </label>
            <select
              name="enrollmentId"
              value={form.enrollmentId}
              onChange={handleChange}
              required
              disabled={!form.studentId}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white disabled:opacity-50"
            >
              <option value="">Select Enrollment</option>
              {filteredEnrollments.map((enrollment: any) => (
                <option key={enrollment.id} value={enrollment.id}>
                  {enrollment.batch?.name} - Total: ₹{enrollment.totalFees} |
                  Paid: ₹{enrollment.paidAmount}
                </option>
              ))}
            </select>
          </div>

          {/* Enrollment Summary */}
          {selectedEnrollment && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                Total Fees: ₹{selectedEnrollment.totalFees} | Paid: ₹
                {selectedEnrollment.paidAmount} | Due: ₹
                {selectedEnrollment.dueAmount}
              </p>
            </div>
          )}

          {/* Amount and Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="5000"
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
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="Same as amount if not specified"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tax (GST)
              </label>
              <input
                type="number"
                name="tax"
                value={form.tax}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method *
              </label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="ONLINE">Online</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="MANUAL">Manual</option>
                <option value="INSTALLMENT">Installment</option>
              </select>
            </div>
          </div>

          {/* Payment Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Status */}
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
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Transaction Details (conditional) */}
          {(form.method === "ONLINE" ||
            form.method === "CARD" ||
            form.method === "UPI" ||
            form.method === "NET_BANKING") && (
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-white font-medium">Transaction Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={form.transactionId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="TXN123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Gateway
                </label>
                <input
                  type="text"
                  name="paymentGateway"
                  value={form.paymentGateway}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="Razorpay, Stripe, etc."
                />
              </div>

              {form.method === "CARD" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Last 4
                    </label>
                    <input
                      type="text"
                      name="cardLast4"
                      value={form.cardLast4}
                      onChange={handleChange}
                      maxLength={4}
                      className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                      placeholder="1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Brand
                    </label>
                    <input
                      type="text"
                      name="cardBrand"
                      value={form.cardBrand}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                      placeholder="Visa, Mastercard"
                    />
                  </div>
                </div>
              )}

              {form.method === "UPI" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={form.upiId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                    placeholder="user@okhdfcbank"
                  />
                </div>
              )}

              {form.method === "NET_BANKING" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                    placeholder="HDFC Bank"
                  />
                </div>
              )}
            </div>
          )}

          {/* Manual Payment Details */}
          {form.method === "MANUAL" && (
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-white font-medium">Manual Payment Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="manualReference"
                  value={form.manualReference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="Bank slip number, transaction reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Receipt URL
                </label>
                <input
                  type="url"
                  name="receiptUrl"
                  value={form.receiptUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                  placeholder="https://example.com/receipt.pdf"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Additional notes about this payment..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={onGenerateInvoice}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              Generate Invoice
            </button>

            <div className="flex gap-3">
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Payment"
                    : "Update Payment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================
// VIEW PAYMENT MODAL
// =============================================

interface ViewPaymentModalProps {
  payment: Payment;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onVerify: () => void;
  onRefund: () => void;
  onReceipt: () => void;
  formatCurrency: (amount?: number | null) => string;
  formatDateTime: (dateString?: string | null) => string;
}

const ViewPaymentModal = ({
  payment,
  isLoading,
  onClose,
  onEdit,
  onVerify,
  onRefund,
  onReceipt,
  formatCurrency,
  formatDateTime,
}: ViewPaymentModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-400";
      case "FAILED":
        return "bg-red-500/20 text-red-400";
      case "REFUNDED":
        return "bg-purple-500/20 text-purple-400";
      case "OVERDUE":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "ONLINE":
        return <Globe className="w-5 h-5" />;
      case "CARD":
        return <CreditCard className="w-5 h-5" />;
      case "UPI":
        return <QrCode className="w-5 h-5" />;
      case "NET_BANKING":
        return <Landmark className="w-5 h-5" />;
      case "MANUAL":
        return <FileText className="w-5 h-5" />;
      case "INSTALLMENT":
        return <Wallet className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white text-lg">Loading payment details...</p>
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
            <DollarSign className="w-5 h-5 text-blue-400" />
            Payment Details
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
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">
                  Invoice #{payment.invoiceNumber}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                >
                  {payment.status}
                </span>
              </div>
              <p className="text-gray-400 mt-1">
                {payment.transactionId || "No transaction ID"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onReceipt}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <ReceiptText className="w-4 h-4" />
                Receipt
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Student & Batch Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Student Information
              </h4>
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {payment.student?.name}
                </p>
                <p className="text-sm text-gray-400">
                  {payment.student?.email}
                </p>
                <p className="text-sm text-gray-400">
                  {payment.student?.phone}
                </p>
                <p className="text-sm text-gray-400">
                  Class: {payment.student?.class || "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Batch Information
              </h4>
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {payment.enrollment?.batch.name}
                </p>
                <p className="text-sm text-gray-400">
                  {payment.enrollment?.batch.subject}
                </p>
                <p className="text-sm text-gray-400">
                  Total Fees: {formatCurrency(payment.enrollment?.totalFees)}
                </p>
                <p className="text-sm text-gray-400">
                  Paid: {formatCurrency(payment.enrollment?.paidAmount)} | Due:{" "}
                  {formatCurrency(payment.enrollment?.dueAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Amount</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(payment.amount)}
              </p>
              {payment.tax ? (
                <p className="text-xs text-gray-500">
                  Tax: {formatCurrency(payment.tax)}
                </p>
              ) : null}
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(payment.paidAmount)}
              </p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Due Amount</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(payment.dueAmount)}
              </p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                {getMethodIcon(payment.method)}
                Payment Method
              </h4>
              <div className="space-y-2">
                <p className="text-white">{payment.method}</p>
                {payment.paymentGateway && (
                  <p className="text-sm text-gray-400">
                    Gateway: {payment.paymentGateway}
                  </p>
                )}
                {payment.transactionId && (
                  <p className="text-sm text-gray-400">
                    Transaction ID: {payment.transactionId}
                  </p>
                )}
                {payment.cardLast4 && (
                  <p className="text-sm text-gray-400">
                    Card: **** **** **** {payment.cardLast4} (
                    {payment.cardBrand})
                  </p>
                )}
                {payment.upiId && (
                  <p className="text-sm text-gray-400">
                    UPI ID: {payment.upiId}
                  </p>
                )}
                {payment.bankName && (
                  <p className="text-sm text-gray-400">
                    Bank: {payment.bankName}
                  </p>
                )}
                {payment.manualReference && (
                  <p className="text-sm text-gray-400">
                    Reference: {payment.manualReference}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Dates
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Payment Date:{" "}
                  <span className="text-white">
                    {formatDateTime(payment.paymentDate)}
                  </span>
                </p>
                {payment.dueDate && (
                  <p className="text-sm text-gray-400">
                    Due Date:{" "}
                    <span className="text-white">
                      {formatDateTime(payment.dueDate)}
                    </span>
                  </p>
                )}
                {payment.verifiedAt && (
                  <p className="text-sm text-gray-400">
                    Verified At:{" "}
                    <span className="text-white">
                      {formatDateTime(payment.verifiedAt)}
                    </span>
                  </p>
                )}
                {payment.refundedAt && (
                  <p className="text-sm text-gray-400">
                    Refunded At:{" "}
                    <span className="text-white">
                      {formatDateTime(payment.refundedAt)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Verification & Refund Info */}
          {(payment.verifiedBy || payment.refundAmount) && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              {payment.verifiedBy && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Verification Details
                  </h4>
                  <p className="text-sm text-gray-400">
                    Verified by: {payment.verifiedBy}
                  </p>
                  <p className="text-sm text-gray-400">
                    Verified at: {formatDateTime(payment.verifiedAt)}
                  </p>
                </div>
              )}

              {payment.refundAmount && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    Refund Details
                  </h4>
                  <p className="text-sm text-gray-400">
                    Amount: {formatCurrency(payment.refundAmount)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Reason: {payment.refundReason}
                  </p>
                  {payment.refundId && (
                    <p className="text-sm text-gray-400">
                      Refund ID: {payment.refundId}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reminders */}
          {payment.remindersSent > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                Reminders Sent: {payment.remindersSent}
              </h4>
              {payment.lastReminderSent && (
                <p className="text-sm text-gray-400">
                  Last: {formatDateTime(payment.lastReminderSent)}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-white font-medium mb-2">Notes</h4>
              <p className="text-gray-400">{payment.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
            {payment.status === "PENDING" && payment.method === "MANUAL" && (
              <button
                onClick={onVerify}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Payment
              </button>
            )}

            {payment.status === "COMPLETED" && (
              <button
                onClick={onRefund}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Refund
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// RECEIPT MODAL
// =============================================

interface ReceiptModalProps {
  payment: Payment;
  receipt: PaymentReceipt;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
  formatCurrency: (amount?: number | null) => string;
  formatDateTime: (dateString?: string | null) => string;
}

const ReceiptModal = ({
  payment,
  receipt,
  onClose,
  onPrint,
  onDownload,
  formatCurrency,
  formatDateTime,
}: ReceiptModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Payment Receipt
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">GRAVITY</h1>
            <p className="text-gray-600">Physics Learning Platform</p>
            <p className="text-sm text-gray-500 mt-2">Payment Receipt</p>
          </div>

          {/* Invoice Info */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-gray-600">Invoice Number:</p>
              <p className="text-lg font-bold text-gray-900">
                {receipt.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date:</p>
              <p className="text-gray-900">
                {formatDateTime(payment.paymentDate)}
              </p>
            </div>
          </div>

          {/* Student Details */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Student Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name:</p>
                <p className="text-gray-900">{receipt.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="text-gray-900">{receipt.studentEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone:</p>
                <p className="text-gray-900">{receipt.studentPhone}</p>
              </div>
              {receipt.studentAddress && (
                <div>
                  <p className="text-sm text-gray-600">Address:</p>
                  <p className="text-gray-900">{receipt.studentAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Batch Details */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Batch Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Batch Name:</p>
                <p className="text-gray-900">{receipt.batchName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subject:</p>
                <p className="text-gray-900">{receipt.batchSubject}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Payment Details
            </h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Description
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-gray-800">Course/Batch Fee</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {formatCurrency(receipt.amount)}
                  </td>
                </tr>
                {receipt.tax > 0 && (
                  <tr>
                    <td className="px-4 py-3 text-gray-800">Tax (GST)</td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {formatCurrency(receipt.tax)}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    Total Amount
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {formatCurrency(receipt.totalAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-800">Paid Amount</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {formatCurrency(receipt.paidAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Method:</p>
                <p className="text-gray-900">{receipt.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <p className="text-gray-900">{receipt.status}</p>
              </div>
              {receipt.transactionId && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID:</p>
                  <p className="text-gray-900">{receipt.transactionId}</p>
                </div>
              )}
              {receipt.cardLast4 && (
                <div>
                  <p className="text-sm text-gray-600">Card:</p>
                  <p className="text-gray-900">
                    **** **** **** {receipt.cardLast4} ({receipt.cardBrand})
                  </p>
                </div>
              )}
              {receipt.upiId && (
                <div>
                  <p className="text-sm text-gray-600">UPI ID:</p>
                  <p className="text-gray-900">{receipt.upiId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">Thank you for your payment!</p>
            <p className="text-xs text-gray-500 mt-2">
              This is a computer generated receipt - no signature required.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// VERIFY MODAL
// =============================================

interface VerifyModalProps {
  payment: Payment;
  onClose: () => void;
  onVerify: (approve: boolean) => void;
  notes: string;
  setNotes: (notes: string) => void;
  isLoading?: boolean;
}

const VerifyModal = ({
  payment,
  onClose,
  onVerify,
  notes,
  setNotes,
  isLoading,
}: VerifyModalProps) => {
  const [action, setAction] = useState<"approve" | "reject">("approve");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Verify Manual Payment
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Invoice: {payment.invoiceNumber} - ₹{payment.amount}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction("approve")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  action === "approve"
                    ? "border-green-500 bg-green-500/10"
                    : "border-white/10 bg-gray-800"
                }`}
              >
                <CheckCircle
                  className={`w-6 h-6 mx-auto mb-1 ${
                    action === "approve" ? "text-green-400" : "text-gray-500"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    action === "approve" ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  Approve
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAction("reject")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  action === "reject"
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-gray-800"
                }`}
              >
                <XCircle
                  className={`w-6 h-6 mx-auto mb-1 ${
                    action === "reject" ? "text-red-400" : "text-gray-500"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    action === "reject" ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  Reject
                </p>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder={
                action === "approve"
                  ? "Add verification notes..."
                  : "Reason for rejection..."
              }
            />
          </div>

          {/* Warning for rejection */}
          {action === "reject" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ Rejecting this payment will mark it as failed. This action
                can be reversed later.
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
              onClick={() => onVerify(action === "approve")}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 flex items-center gap-2 ${
                action === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading
                ? "Processing..."
                : action === "approve"
                  ? "Approve Payment"
                  : "Reject Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// REFUND MODAL
// =============================================

interface RefundModalProps {
  payment: Payment;
  onClose: () => void;
  onRefund: () => void;
  refundAmount: number;
  setRefundAmount: (amount: number) => void;
  refundReason: string;
  setRefundReason: (reason: string) => void;
  refundId: string;
  setRefundId: (id: string) => void;
  isLoading?: boolean;
  formatCurrency: (amount?: number | null) => string;
}

const RefundModal = ({
  payment,
  onClose,
  onRefund,
  refundAmount,
  setRefundAmount,
  refundReason,
  setRefundReason,
  refundId,
  setRefundId,
  isLoading,
  formatCurrency,
}: RefundModalProps) => {
  const [isFullRefund, setIsFullRefund] = useState(true);

  useEffect(() => {
    if (isFullRefund) {
      setRefundAmount(payment.amount);
    }
  }, [isFullRefund, payment.amount, setRefundAmount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Process Refund</h2>
          <p className="text-sm text-gray-400 mt-1">
            Invoice: {payment.invoiceNumber} - {formatCurrency(payment.amount)}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Refund Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsFullRefund(true)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isFullRefund
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 bg-gray-800"
                }`}
              >
                <RotateCcw
                  className={`w-6 h-6 mx-auto mb-1 ${
                    isFullRefund ? "text-purple-400" : "text-gray-500"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    isFullRefund ? "text-purple-400" : "text-gray-400"
                  }`}
                >
                  Full Refund
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsFullRefund(false)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  !isFullRefund
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 bg-gray-800"
                }`}
              >
                <Wallet
                  className={`w-6 h-6 mx-auto mb-1 ${
                    !isFullRefund ? "text-purple-400" : "text-gray-500"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    !isFullRefund ? "text-purple-400" : "text-gray-400"
                  }`}
                >
                  Partial Refund
                </p>
              </button>
            </div>
          </div>

          {/* Refund Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refund Amount *
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
              min="1"
              max={payment.amount}
              step="0.01"
              disabled={isFullRefund}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white disabled:opacity-50"
            />
            {!isFullRefund && (
              <p className="text-xs text-gray-500 mt-1">
                Max refund: {formatCurrency(payment.amount)}
              </p>
            )}
          </div>

          {/* Refund Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refund Reason *
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="Why is this payment being refunded?"
            />
          </div>

          {/* Refund ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refund Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={refundId}
              onChange={(e) => setRefundId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              placeholder="REF123456"
            />
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ This action will process a refund of{" "}
              {formatCurrency(refundAmount)}. The amount will be returned to the
              original payment method.
            </p>
          </div>

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
              onClick={onRefund}
              disabled={isLoading || !refundReason || refundAmount <= 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Processing..." : "Process Refund"}
            </button>
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
  onAction: (action: "verify" | "reject" | "delete") => void;
  isLoading?: boolean;
}

const BulkActionModal = ({
  selectedCount,
  onClose,
  onAction,
  isLoading,
}: BulkActionModalProps) => {
  const [action, setAction] = useState<"verify" | "reject" | "delete">(
    "verify",
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(action);
  };

  const getActionColor = () => {
    switch (action) {
      case "verify":
        return "green";
      case "reject":
        return "red";
      case "delete":
        return "red";
      default:
        return "blue";
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case "verify":
        return <CheckCircle className="w-5 h-5" />;
      case "reject":
        return <XCircle className="w-5 h-5" />;
      case "delete":
        return <Trash2 className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Bulk Action - {selectedCount}{" "}
            {selectedCount === 1 ? "Payment" : "Payments"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
            >
              <option value="verify">Verify Payments</option>
              <option value="reject">Reject Payments</option>
              <option value="delete">Delete Payments</option>
            </select>
          </div>

          {/* Notes for verify/reject */}
          {(action === "verify" || action === "reject") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                placeholder={
                  action === "verify"
                    ? "Add verification notes..."
                    : "Reason for rejection..."
                }
              />
            </div>
          )}

          {/* Warnings */}
          {action === "delete" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ This action cannot be undone. {selectedCount} payment
                {selectedCount !== 1 ? "s" : ""} will be permanently deleted.
              </p>
            </div>
          )}

          {action === "reject" && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ {selectedCount} payment{selectedCount !== 1 ? "s" : ""} will
                be marked as failed.
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-300">
              You are about to{" "}
              <span className={`font-semibold text-${getActionColor()}-400`}>
                {action}
              </span>{" "}
              {selectedCount} payment{selectedCount !== 1 ? "s" : ""}.
            </p>
          </div>

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
              disabled={isLoading}
              className={`px-4 py-2 bg-${getActionColor()}-500 text-white rounded-lg hover:bg-${getActionColor()}-600 disabled:opacity-50 flex items-center gap-2`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {getActionIcon()}
              {isLoading
                ? "Processing..."
                : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
