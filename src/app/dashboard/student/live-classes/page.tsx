"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  batchId: string;
  batch?: { name: string; subject: string };
  startTime: string;
  endTime: string;
  meetingLink?: string;
  status: string;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/live-sessions")
      .then((r) => r.json())
      .then((res) => setSessions(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.startTime) > now);
  const past = sessions.filter((s) => new Date(s.startTime) <= now);

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Live Classes</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-400">No upcoming live classes.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{s.title}</p>
                  <p className="text-sm text-gray-400">{s.batch?.name} &middot; {new Date(s.startTime).toLocaleString()}</p>
                </div>
                {s.meetingLink && (
                  <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">Join</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Past Classes</h2>
        {past.length === 0 ? (
          <p className="text-gray-400">No past live classes.</p>
        ) : (
          <div className="space-y-3">
            {past.map((s) => (
              <div key={s.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-white font-medium">{s.title}</p>
                <p className="text-sm text-gray-400">{s.batch?.name} &middot; {new Date(s.startTime).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
