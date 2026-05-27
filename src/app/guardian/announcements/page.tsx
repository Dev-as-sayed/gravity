"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: string;
  priority?: string;
}

const AnnouncementsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/announcements`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAnnouncements(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (userLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Announcements</h1>

      {announcements.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No announcements available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold">{ann.title}</h3>
                {ann.priority && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      ann.priority === "HIGH"
                        ? "bg-red-500/20 text-red-400"
                        : ann.priority === "MEDIUM"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {ann.priority}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm mb-3">{ann.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{ann.author || "Institute"}</span>
                <span>
                  {new Date(ann.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
