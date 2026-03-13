import { baseApi } from "./baseApi";

export const userManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get users with pagination
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search, role, isActive }) => ({
        url: "/users",
        params: { page, limit, search, role, isActive },
      }),
      providesTags: ["User"],
    }),

    // Get single user
    getUserById: builder.query({
      query: (id: string) => `/users/${id}`,
      providesTags: ["User"],
    }),

    // Create user
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Update user
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Toggle user active status
    toggleUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} = userManagementApi;
