"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/store/api/settingApi";

const SettingsPage = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "password">("profile");

  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const { data: notifData } = useGetNotificationPreferencesQuery();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [updateNotif] = useUpdateNotificationPreferencesMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const profile = profileData?.data;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone, bio }).unwrap();
    } catch {
      /* empty */
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg(err?.message || "Failed to change password.");
    }
  };

  const toggleNotif = (key: string, value: boolean) => {
    updateNotif({ [key]: value });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "notifications", label: "Notifications" },
    { key: "password", label: "Password" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="flex gap-4 mb-6 border-b border-gray-700/50 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === t.key
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleProfileUpdate} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 max-w-lg">
          <h2 className="text-white font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Name</label>
              <input
                type="text"
                defaultValue={profile?.name ?? ""}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Email</label>
              <input
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Phone</label>
              <input
                type="tel"
                defaultValue={profile?.phone ?? ""}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Bio</label>
              <textarea
                rows={3}
                defaultValue={profile?.bio ?? ""}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <button
              type="submit"
              disabled={updatingProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {updatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "notifications" && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 max-w-lg">
          <h2 className="text-white font-semibold mb-4">Notification Preferences</h2>
          {notifData?.data ? (
            <div className="space-y-4">
              {([
                ["emailNotifications", "Email Notifications"],
                ["pushNotifications", "Push Notifications"],
                ["smsNotifications", "SMS Notifications"],
                ["digestEmail", "Daily Digest Email"],
                ["marketingEmails", "Marketing Emails"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 text-sm">{label}</span>
                  <input
                    type="checkbox"
                    checked={(notifData.data as any)[key] ?? false}
                    onChange={(e) => toggleNotif(key, e.target.checked)}
                    className="accent-blue-500"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Loading preferences...</p>
          )}
        </div>
      )}

      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 max-w-lg">
          <h2 className="text-white font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                {passwordMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
