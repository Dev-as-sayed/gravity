import { baseApi } from "./baseApi";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationPreference {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  digestEmail: boolean;
  marketingEmails: boolean;
}

export const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ data: Profile }, void>({
      query: () => "/settings/profile",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<Profile, UpdateProfileData>({
      query: (data) => ({ url: "/settings/profile", method: "PUT", body: data }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordData>({
      query: (data) => ({ url: "/settings/change-password", method: "POST", body: data }),
    }),

    getNotificationPreferences: builder.query<{ data: NotificationPreference }, void>({
      query: () => "/settings/notifications",
      providesTags: ["NotificationPreference"],
    }),

    updateNotificationPreferences: builder.mutation<NotificationPreference, Partial<NotificationPreference>>({
      query: (data) => ({ url: "/settings/notifications", method: "PUT", body: data }),
      invalidatesTags: ["NotificationPreference"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = settingApi;
