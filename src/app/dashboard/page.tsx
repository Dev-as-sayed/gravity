"use client";

import { useGetModeratorStatsQuery } from "@/store/api/moderatorApi";
import { useGetDoubtsQuery } from "@/store/api/doubtApi";
import { useGetPostsQuery } from "@/store/api/mediaApi";

const ModeratorDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useGetModeratorStatsQuery();
  const { data: doubts } = useGetDoubtsQuery({ status: "OPEN", limit: 1 });
  const { data: pendingPosts } = useGetPostsQuery({ status: "PENDING", limit: 1 });

  const loading = statsLoading;

  const cards = [
    { label: "Total Moderators", value: stats?.data?.total, icon: "🛡️" },
    { label: "Active Moderators", value: stats?.data?.active, icon: "✅" },
    { label: "Pending Doubts", value: doubts?.meta?.total ?? "--", icon: "❓" },
    { label: "Pending Posts", value: pendingPosts?.meta?.total ?? "--", icon: "📝" },
    { label: "Actions Taken", value: stats?.data?.topModerators?.reduce((a, b) => a + b.actionsTaken, 0) ?? "--", icon: "⚡" },
    { label: "Resolved Issues", value: stats?.data?.topModerators?.reduce((a, b) => a + b.resolvedIssues, 0) ?? "--", icon: "✅" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Moderator Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">{card.label}</h3>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-bold text-white mt-2">
              {loading ? (
                <span className="inline-block w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                card.value ?? "--"
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeratorDashboard;
