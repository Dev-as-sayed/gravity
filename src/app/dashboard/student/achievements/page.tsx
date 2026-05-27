"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
  type: string;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((res) => setAchievements(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const earned = achievements.filter((a) => a.earnedAt);
  const locked = achievements.filter((a) => !a.earnedAt);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Achievements</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Earned ({earned.length})</h2>
        {earned.length === 0 ? (
          <p className="text-gray-400">No achievements earned yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((a) => (
              <div key={a.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-lg shrink-0">
                  {a.icon || "🏆"}
                </div>
                <div>
                  <h3 className="text-white font-medium">{a.title}</h3>
                  {a.description && <p className="text-gray-400 text-xs mt-1">{a.description}</p>}
                  {a.earnedAt && <p className="text-gray-500 text-xs mt-1">Earned {new Date(a.earnedAt).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Locked ({locked.length})</h2>
        {locked.length === 0 ? (
          <p className="text-gray-400">No locked achievements.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((a) => (
              <div key={a.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 flex items-start gap-3 opacity-60">
                <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-500 text-lg shrink-0">
                  🔒
                </div>
                <div>
                  <h3 className="text-gray-300 font-medium">{a.title}</h3>
                  {a.description && <p className="text-gray-500 text-xs mt-1">{a.description}</p>}
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
