"use client";

import { useState } from "react";
import { useGetQuizzesQuery, useGetQuizAnalyticsQuery } from "@/store/api/quizApi";

const QuizResultsPage = () => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const { data: quizzesData, isLoading: quizzesLoading } = useGetQuizzesQuery({
    limit: 50,
  });
  const { data: analytics, isLoading: analyticsLoading } =
    useGetQuizAnalyticsQuery(selectedQuizId, { skip: !selectedQuizId });

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const quizzes = quizzesData?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Quiz Results</h1>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Select Quiz
        </label>
        <select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="w-full max-w-md px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Choose a quiz...</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>

      {!selectedQuizId ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">Select a quiz to view its results and analytics.</p>
        </div>
      ) : analyticsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : analytics?.data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Attempts</h3>
            <p className="text-2xl font-bold text-white">
              {analytics.data.totalAttempts}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Average Score</h3>
            <p className="text-2xl font-bold text-white">
              {analytics.data.averageScore.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Pass Rate</h3>
            <p className="text-2xl font-bold text-white">
              {analytics.data.passRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Avg Time</h3>
            <p className="text-2xl font-bold text-white">
              {Math.round(analytics.data.timeAnalysis.avg_time_seconds / 60)} min
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No analytics available for this quiz.</p>
        </div>
      )}
    </div>
  );
};

export default QuizResultsPage;
