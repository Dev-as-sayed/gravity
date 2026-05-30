"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useGetGradesQuery, useGetGradeStatsQuery } from "@/store/api/gradeApi";
import { useGetExamsQuery } from "@/store/api/examApi";
import { useGetBatchesQuery } from "@/store/api/batchApi";

const GradePage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [batchId, setBatchId] = useState("");
  const [examId, setExamId] = useState("");

  const { data, isLoading, error } = useGetGradesQuery({
    page,
    limit: 10,
    batchId: batchId || undefined,
    examId: examId || undefined,
  });
  const { data: stats } = useGetGradeStatsQuery();
  const { data: examsData } = useGetExamsQuery({ page: 1, limit: 100 });
  const { data: batchesData } = useGetBatchesQuery({ page: 1, limit: 100 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
        <p className="text-red-400">Failed to load grades.</p>
      </div>
    );
  }

  const grades = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Grade Management</h1>
      </div>

      {stats?.data && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Total Records</p>
            <p className="text-white text-xl font-bold">{stats.data.totalRecords}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Avg Percentage</p>
            <p className="text-white text-xl font-bold">{stats.data.averagePercentage.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Passed</p>
            <p className="text-green-400 text-xl font-bold">{stats.data.passedCount}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Failed</p>
            <p className="text-red-400 text-xl font-bold">{stats.data.failedCount}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={batchId}
            onChange={(e) => { setBatchId(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Batches</option>
            {batchesData?.data?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={examId}
            onChange={(e) => { setExamId(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Exams</option>
            {examsData?.data?.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No grade records found.</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700/50">
                <th className="p-4">Student</th>
                <th className="p-4">Exam</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-gray-700/30 text-gray-300">
                  <td className="p-4">{g.student?.name ?? "N/A"}</td>
                  <td className="p-4">{g.exam?.title ?? "N/A"}</td>
                  <td className="p-4">{g.exam?.subject ?? "N/A"}</td>
                  <td className="p-4">{g.obtainedMarks}/{g.totalMarks}</td>
                  <td className="p-4">{g.percentage.toFixed(1)}%</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      g.grade && ["A", "B"].includes(g.grade)
                        ? "bg-green-500/20 text-green-400"
                        : g.grade === "C"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}>
                      {g.grade ?? "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      g.status === "PASSED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">Page {page} of {data.meta.totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GradePage;
