"use client";

import { useUser } from "@/hooks/useUser";
import { useState } from "react";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 max-w-2xl space-y-6">
        <h2 className="text-lg font-semibold text-white">Preferences</h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Push Notifications</p>
              <p className="text-sm text-gray-400">Receive push notifications for updates</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? "bg-blue-600" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifications ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Email Updates</p>
              <p className="text-sm text-gray-400">Receive email notifications</p>
            </div>
            <button
              onClick={() => setEmailUpdates(!emailUpdates)}
              className={`w-12 h-6 rounded-full transition-colors relative ${emailUpdates ? "bg-blue-600" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${emailUpdates ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Dark Mode</p>
              <p className="text-sm text-gray-400">Use dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-blue-600" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 max-w-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <p className="text-gray-400 text-sm">Email: {user?.email || "--"}</p>
        <p className="text-gray-400 text-sm mt-1">Role: {user?.role || "--"}</p>
      </div>
    </div>
  );
};

export default Page;
