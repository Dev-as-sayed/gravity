"use client";

import { useGetBatchStatsQuery } from "@/store/api/batchApi";
import { useGetExamStatsQuery } from "@/store/api/examApi";
import { useGetDoubtStatsQuery } from "@/store/api/doubtApi";

const TeacherDashboard = () => {
  const { data: batchStats, isLoading: batchLoading } = useGetBatchStatsQuery();
  const { data: examStats, isLoading: examLoading } = useGetExamStatsQuery();
  const { data: doubtStats, isLoading: doubtLoading } = useGetDoubtStatsQuery();

  const loading = batchLoading || examLoading || doubtLoading;

  const cards = [
    {
      label: "Total Students",
      value: batchStats?.enrollments,
      icon: "👥",
    },
    {
      label: "Active Batches",
      value: batchStats?.active,
      icon: "📚",
    },
    {
      label: "Upcoming Exams",
      value: examStats?.upcoming,
      icon: "📝",
    },
    {
      label: "Pending Doubts",
      value: doubtStats?.open,
      icon: "❓",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">
                {card.label}
              </h3>
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

export default TeacherDashboard;
