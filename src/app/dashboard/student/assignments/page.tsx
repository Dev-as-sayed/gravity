"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  batchId: string;
  batch?: { name: string; subject: string };
  status: string;
  marks?: number;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments")
      .then((r) => r.json())
      .then((res) => setAssignments(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const pending = assignments.filter((a) => a.status !== "SUBMITTED" && a.status !== "GRADED");
  const completed = assignments.filter((a) => a.status === "SUBMITTED" || a.status === "GRADED");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Assignments</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-gray-400">No pending assignments.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{a.title}</p>
                    <p className="text-sm text-gray-400">{a.batch?.name} &middot; Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Completed ({completed.length})</h2>
        {completed.length === 0 ? (
          <p className="text-gray-400">No completed assignments.</p>
        ) : (
          <div className="space-y-3">
            {completed.map((a) => (
              <div key={a.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{a.title}</p>
                    <p className="text-sm text-gray-400">{a.batch?.name} {a.marks !== undefined && <>&middot; Marks: {a.marks}</>}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/20 text-green-400">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
