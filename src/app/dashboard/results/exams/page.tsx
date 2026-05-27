"use client";

import { useState } from "react";
import { useGetExamsQuery, useGetExamResultsQuery } from "@/store/api/examApi";

const ExamResultsPage = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data: examsData, isLoading: examsLoading } = useGetExamsQuery({
    limit: 50,
  });
  const { data: results, isLoading: resultsLoading } = useGetExamResultsQuery(
    { examId: selectedExamId, page, limit: 10 },
    { skip: !selectedExamId },
  );

  if (examsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const exams = examsData?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Exam Results</h1>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Select Exam
        </label>
        <select
          value={selectedExamId}
          onChange={(e) => {
            setSelectedExamId(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Choose an exam...</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      {!selectedExamId ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">Select an exam to view its results.</p>
        </div>
      ) : resultsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results && results.data.length > 0 ? (
        <>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Obtained</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Percentage</th>
                  <th className="pb-3 font-medium">Grade</th>
                  <th className="pb-3 font-medium">Rank</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm">
                {results.data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-700/50">
                    <td className="py-3">{r.student?.name ?? "N/A"}</td>
                    <td className="py-3">{r.obtainedMarks}</td>
                    <td className="py-3">{r.totalMarks}</td>
                    <td className="py-3">{r.percentage.toFixed(1)}%</td>
                    <td className="py-3">{r.grade ?? "N/A"}</td>
                    <td className="py-3">{r.rank ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {results.meta && results.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {page} of {results.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!results.meta.hasNextPage}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No results found for this exam.</p>
        </div>
      )}
    </div>
  );
};

export default ExamResultsPage;
