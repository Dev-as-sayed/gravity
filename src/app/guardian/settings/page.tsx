"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

const SettingsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    attendance: true,
    results: true,
    payments: true,
    announcements: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/guardians/${user?.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      const data = await res.json();
      if (data.success) setSaved(true);
    } catch {}
  };

  if (userLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to manage settings.</p>
      </div>
    );
  }

  const toggles: Array<{
    key: keyof typeof notifications;
    label: string;
  }> = [
    { key: "email", label: "Email Notifications" },
    { key: "sms", label: "SMS Notifications" },
    { key: "attendance", label: "Attendance Alerts" },
    { key: "results", label: "Result Updates" },
    { key: "payments", label: "Payment Reminders" },
    { key: "announcements", label: "Announcements" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">
          Notification Preferences
        </h2>

        <div className="space-y-4">
          {toggles.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between"
            >
              <span className="text-gray-300">{label}</span>
              <button
                onClick={() => handleToggle(key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[key]
                    ? "bg-blue-500"
                    : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications[key]
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
          {saved && (
            <span className="ml-3 text-green-400 text-sm">
              Settings saved successfully!
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <p className="text-gray-400 text-sm mb-4">
          Manage your account settings and security.
        </p>
        <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
