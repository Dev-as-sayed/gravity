// src/store/api/messageApi.ts

import { baseApi } from "./baseApi";

// ==================== TYPES ====================

export interface Message {
  id: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  receiverId: string;
  receiver?: {
    id: string;
    name: string;
    profileImage?: string | null;
  } | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

export interface MessageFilters {
  page?: number;
  limit?: number;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
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

// ==================== API ENDPOINTS ====================

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    getConversations: builder.query<PaginatedResponse<Conversation>, MessageFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        return {
          url: `/messages?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Conversation"],
    }),

    getConversation: builder.query<Message[], { userId: string; otherUserId: string }>({
      query: ({ userId, otherUserId }) =>
        `/messages/conversation?userId=${userId}&otherUserId=${otherUserId}`,
      providesTags: (result, error, { userId, otherUserId }) => [
        { type: "Message", id: `${userId}_${otherUserId}` },
      ],
      transformResponse: (response: { data: Message[] }) => response.data,
    }),

    // ==================== MUTATIONS ====================

    sendMessage: builder.mutation<Message, SendMessageData>({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conversation"],
      transformErrorResponse: (response: any) => ({
        status: response?.status || 500,
        message: response?.data?.message || "Failed to send message",
        errors: response?.data?.errors || [],
      }),
    }),

    deleteMessage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Message", id },
        "Conversation",
      ],
    }),
  }),
});

// ==================== HOOKS ====================

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
} = messageApi;
