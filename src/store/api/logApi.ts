import { baseApi } from "./baseApi";

export interface LogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description?: string | null;
  performedBy?: { id: string; name: string };
  metadata?: any;
  createdAt: string;
}

export interface LogFilters {
  page?: number;
  limit?: number;
  entity?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
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

export const logApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query<PaginatedResponse<LogEntry>, LogFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return { url: `/logs?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "Log" as const, id })), { type: "Log", id: "LIST" }]
          : [{ type: "Log", id: "LIST" }],
    }),
  }),
});

export const {
  useGetLogsQuery,
} = logApi;
