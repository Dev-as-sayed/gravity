// src/store/api/paymentApi.ts
import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Payment {
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
  gatewayResponse?: any;
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
  refundId?: string | null;
  notes?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;

  // Relations
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
      teacher?: {
        id: string;
        name: string;
      };
    };
    totalFees: number;
    paidAmount: number;
    dueAmount: number;
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  studentId?: string;
  enrollmentId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  transactionId?: string;
  sortBy?: "paymentDate" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreatePaymentData {
  enrollmentId: string;
  studentId: string;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  tax?: number;
  totalAmount?: number;
  method: string;
  status?: string;
  transactionId?: string;
  paymentGateway?: string;
  gatewayResponse?: any;
  cardLast4?: string;
  cardBrand?: string;
  upiId?: string;
  bankName?: string;
  manualReference?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  paymentDate?: string;
  dueDate?: string;
  receiptUrl?: string;
  notes?: string;
  metadata?: any;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export interface VerifyPaymentData {
  approve: boolean;
  notes?: string;
}

export interface RefundPaymentData {
  amount?: number;
  reason: string;
  refundId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaymentStats {
  total: number;
  totalRevenue: number;
  byStatus: Array<{ status: string; _count: number; _sum: { amount: number } }>;
  byMethod: Array<{ method: string; _count: number; _sum: { amount: number } }>;
  monthlyRevenue: Array<{ month: string; count: number; revenue: number }>;
  recentPayments: Payment[];
  pendingVerification: number;
  averagePayment: number;
}

export interface PaymentReceipt {
  invoiceNumber: string;
  paymentDate: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentAddress?: string | null;
  batchName: string;
  batchSubject: string;
  amount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  method: string;
  status: string;
  transactionId?: string | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  upiId?: string | null;
  bankName?: string | null;
}

export interface ReminderResponse {
  paymentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  batchName: string;
  dueDate: string;
  amount: number;
  daysUntilDue: number;
}

// ==================== API ENDPOINTS ====================

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PAYMENT QUERIES ====================

    /**
     * Get paginated list of payments with filters
     */
    getPayments: builder.query<PaginatedResponse<Payment>, PaymentFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/payments?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Payment" as const,
                id,
              })),
              { type: "Payment", id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),

    /**
     * Get single payment by ID
     */
    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: "Payment", id }],
      transformResponse: (response: { data: Payment }) => response.data,
    }),

    /**
     * Get payment statistics
     */
    getPaymentStats: builder.query<{ data: PaymentStats }, void>({
      query: () => "/payments/stats",
      providesTags: ["PaymentStats"],
    }),

    /**
     * Get payment receipt
     */
    getPaymentReceipt: builder.query<{ data: PaymentReceipt }, string>({
      query: (id) => `/payments/${id}/receipt`,
      providesTags: (result, error, id) => [{ type: "PaymentReceipt", id }],
    }),

    /**
     * Get payments by student
     */
    getStudentPayments: builder.query<
      PaginatedResponse<Payment>,
      { studentId: string; page?: number; limit?: number }
    >({
      query: ({ studentId, page = 1, limit = 10 }) =>
        `/payments?studentId=${studentId}&page=${page}&limit=${limit}`,
      providesTags: (result, error, { studentId }) => [
        { type: "StudentPayments", id: studentId },
      ],
    }),

    /**
     * Get payments by enrollment
     */
    getEnrollmentPayments: builder.query<Payment[], string>({
      query: (enrollmentId) => `/payments?enrollmentId=${enrollmentId}`,
      providesTags: (result, error, enrollmentId) => [
        { type: "EnrollmentPayments", id: enrollmentId },
      ],
      transformResponse: (response: { data: Payment[] }) => response.data,
    }),

    // ==================== PAYMENT MUTATIONS ====================

    /**
     * Create a new payment
     */
    createPayment: builder.mutation<Payment, CreatePaymentData>({
      query: (data) => ({
        url: "/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to create payment",
        errors: response?.data?.errors || [],
      }),
    }),

    /**
     * Update an existing payment
     */
    updatePayment: builder.mutation<
      Payment,
      { id: string; data: UpdatePaymentData }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
    }),

    /**
     * Delete a payment
     */
    deletePayment: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
    }),

    /**
     * Verify a payment (for manual payments)
     */
    verifyPayment: builder.mutation<
      Payment,
      { id: string; data: VerifyPaymentData }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}/verify`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
    }),

    /**
     * Refund a payment
     */
    refundPayment: builder.mutation<
      Payment,
      { id: string; data: RefundPaymentData }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}/refund`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
    }),

    /**
     * Mark payment as failed
     */
    failPayment: builder.mutation<Payment, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/payments/${id}/verify`,
        method: "POST",
        body: { approve: false, notes: reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        "PaymentStats",
      ],
    }),

    /**
     * Send payment reminders
     */
    sendPaymentReminders: builder.mutation<
      ReminderResponse[],
      { daysBefore?: number }
    >({
      query: ({ daysBefore = 7 }) => ({
        url: "/payments/reminders",
        method: "POST",
        body: { daysBefore },
      }),
      invalidatesTags: ["Payment", "PaymentStats"],
    }),

    /**
     * Generate invoice number
     */
    generateInvoice: builder.mutation<{ invoiceNumber: string }, void>({
      query: () => ({
        url: "/payments/generate-invoice",
        method: "POST",
      }),
    }),

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk verify payments
     */
    bulkVerifyPayments: builder.mutation<
      { success: boolean; count: number },
      { paymentIds: string[]; approve: boolean; notes?: string }
    >({
      query: (data) => ({
        url: "/payments/bulk/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
    }),

    /**
     * Bulk delete payments
     */
    bulkDeletePayments: builder.mutation<
      { success: boolean; count: number },
      string[]
    >({
      query: (paymentIds) => ({
        url: "/payments/bulk/delete",
        method: "POST",
        body: { paymentIds },
      }),
      invalidatesTags: [
        { type: "Payment", id: "LIST" },
        "PaymentStats",
        "Enrollment",
      ],
    }),
  }),
});

// ==================== HOOKS ====================

// Payment queries
export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentStatsQuery,
  useGetPaymentReceiptQuery,
  useGetStudentPaymentsQuery,
  useGetEnrollmentPaymentsQuery,
} = paymentApi;

// Payment mutations
export const {
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useVerifyPaymentMutation,
  useRefundPaymentMutation,
  useFailPaymentMutation,
  useSendPaymentRemindersMutation,
  useGenerateInvoiceMutation,
} = paymentApi;

// Bulk operations
export const { useBulkVerifyPaymentsMutation, useBulkDeletePaymentsMutation } =
  paymentApi;

// ==================== HELPER HOOKS ====================

/**
 * Hook to prefetch payment data
 */
export const usePrefetchPayment = () => {
  const api = paymentApi.usePrefetch("getPaymentById");
  return (id: string) => api(id);
};

/**
 * Hook to get payments with auto-refresh
 */
export const usePaymentsWithAutoRefresh = (filters: PaymentFilters) => {
  return useGetPaymentsQuery(filters, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get pending payments
 */
export const usePendingPayments = (
  filters?: Omit<PaymentFilters, "status">,
) => {
  return useGetPaymentsQuery({
    ...filters,
    status: "PENDING",
    page: filters?.page || 1,
    limit: filters?.limit || 10,
  });
};

/**
 * Hook to get completed payments
 */
export const useCompletedPayments = (
  filters?: Omit<PaymentFilters, "status">,
) => {
  return useGetPaymentsQuery({
    ...filters,
    status: "COMPLETED",
    page: filters?.page || 1,
    limit: filters?.limit || 10,
  });
};

/**
 * Hook to get overdue payments
 */
export const useOverduePayments = (
  filters?: Omit<PaymentFilters, "status">,
) => {
  return useGetPaymentsQuery({
    ...filters,
    status: "OVERDUE",
    page: filters?.page || 1,
    limit: filters?.limit || 10,
  });
};
