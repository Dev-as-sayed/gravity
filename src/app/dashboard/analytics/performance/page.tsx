"use client";

import { useGetBatchStatsQuery } from "@/store/api/batchApi";
import { useGetExamStatsQuery } from "@/store/api/examApi";
import { useGetDoubtStatsQuery } from "@/store/api/doubtApi";

const PerformanceAnalyticsPage = () => {
  const { data: batchStats, isLoading: batchLoading } = useGetBatchStatsQuery();
  const { data: examStats, isLoading: examLoading } = useGetExamStatsQuery();
  const { data: doubtStats, isLoading: doubtLoading } = useGetDoubtStatsQuery();

  const loading = batchLoading || examLoading || doubtLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Performance Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Batch Stats</h3>
          <div className="space-y-2 text-white">
            <p>Total Batches: {batchStats?.total ?? "--"}</p>
            <p>Active: {batchStats?.active ?? "--"}</p>
            <p>Enrollments: {batchStats?.enrollments ?? "--"}</p>
            <p>Completion Rate: {batchStats?.completionRate ?? "--"}%</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Exam Stats</h3>
          <div className="space-y-2 text-white">
            <p>Total Exams: {examStats?.total ?? "--"}</p>
            <p>Upcoming: {examStats?.upcoming ?? "--"}</p>
            <p>Completed: {examStats?.completed ?? "--"}</p>
            <p>Average Marks: {examStats?.averageMarks ?? "--"}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Doubt Stats</h3>
          <div className="space-y-2 text-white">
            <p>Total Doubts: {doubtStats?.total ?? "--"}</p>
            <p>Open: {doubtStats?.open ?? "--"}</p>
            <p>Resolved: {doubtStats?.resolved ?? "--"}</p>
            <p>Resolution Rate: {doubtStats?.resolutionRate ?? "--"}%</p>
          </div>
        </div>
      </div>

      {batchStats?.popularSubjects && batchStats.popularSubjects.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-4">Popular Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchStats.popularSubjects.map((s) => (
              <div
                key={s.subject}
                className="flex items-center justify-between bg-gray-700/30 rounded-lg px-4 py-3"
              >
                <span className="text-white">{s.subject}</span>
                <span className="text-gray-400 text-sm">{s._count} batches</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalyticsPage;
