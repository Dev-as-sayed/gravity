"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Recording {
  id: string;
  title: string;
  batchId: string;
  batch?: { name: string; subject: string };
  recordingUrl?: string;
  duration?: number;
  startTime: string;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/live-sessions?isCompleted=true")
      .then((r) => r.json())
      .then((res) => setRecordings(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Recorded Sessions</h1>
      {recordings.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No recordings available.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recordings.map((r) => (
            <div key={r.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{r.title}</h3>
                  <p className="text-sm text-gray-400">{r.batch?.name} &middot; {new Date(r.startTime).toLocaleDateString()}</p>
                </div>
                {r.recordingUrl && (
                  <a href={r.recordingUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Watch</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
