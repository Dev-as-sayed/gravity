// src/store/api/supportApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  } | null;
  subject: string;
  description: string;
  category: "GENERAL" | "TECHNICAL" | "BILLING" | "ACCOUNT" | "COURSE" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
  assignedTo?: string | null;
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  content: string;
  attachments?: string[];
  isStaff: boolean;
  createdAt: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: SupportTicket["category"];
  priority?: SupportTicket["priority"];
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  category?: SupportTicket["category"];
  priority?: SupportTicket["priority"];
  status?: SupportTicket["status"];
  assignedTo?: string | null;
}

export interface AddTicketMessageData {
  content: string;
  attachments?: string[];
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

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
  byPriority: Array<{ priority: string; _count: number }>;
  byCategory: Array<{ category: string; _count: number }>;
  averageResolutionTime: number;
}

// ==================== API ENDPOINTS ====================

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getTickets: builder.query<PaginatedResponse<SupportTicket>, TicketFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/support?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "SupportTicket" as const, id })),
              { type: "SupportTicket", id: "LIST" },
            ]
          : [{ type: "SupportTicket", id: "LIST" }],
    }),

    getTicket: builder.query<SupportTicket, string>({
      query: (id) => `/support/${id}`,
      providesTags: (result, error, id) => [{ type: "SupportTicket", id }],
      transformResponse: (response: { data: SupportTicket }) => response.data,
    }),

    getTicketMessages: builder.query<TicketMessage[], string>({
      query: (id) => `/support/${id}/messages`,
      providesTags: (result, error, id) => [{ type: "TicketMessage", id }],
      transformResponse: (response: { data: TicketMessage[] }) => response.data,
    }),

    getTicketStats: builder.query<{ data: TicketStats }, void>({
      query: () => "/support/stats",
      providesTags: ["SupportTicketStats"],
    }),

    // ==================== MUTATIONS ====================

    createTicket: builder.mutation<SupportTicket, CreateTicketData>({
      query: (data) => ({
        url: "/support",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SupportTicket", id: "LIST" }, "SupportTicketStats"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to create ticket",
        errors: response?.data?.errors || [],
      }),
    }),

    updateTicket: builder.mutation<SupportTicket, { id: string; data: UpdateTicketData }>({
      query: ({ id, data }) => ({
        url: `/support/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        { type: "SupportTicket", id: "LIST" },
        "SupportTicketStats",
      ],
    }),

    deleteTicket: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/support/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SupportTicket", id },
        { type: "SupportTicket", id: "LIST" },
        "SupportTicketStats",
      ],
    }),

    addTicketMessage: builder.mutation<TicketMessage, { id: string; data: AddTicketMessageData }>({
      query: ({ id, data }) => ({
        url: `/support/${id}/messages`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        { type: "TicketMessage", id },
      ],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useGetTicketMessagesQuery,
  useGetTicketStatsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useAddTicketMessageMutation,
} = supportApi;
