"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetQuizzesQuery,
  useDeleteQuizMutation,
  usePublishQuizMutation,
} from "@/store/api/quizApi";
import Link from "next/link";

const QuizzesPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetQuizzesQuery({
    page,
    limit: 10,
    teacherId: session?.user?.id,
  });
  const [deleteQuiz] = useDeleteQuizMutation();
  const [publishQuiz] = usePublishQuizMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const quizzes = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Quizzes</h1>
        <Link
          href="/dashboard/quizzes/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Create Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No quizzes found. Create your first quiz!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{quiz.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {quiz.description ?? "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Status: {quiz.status}</span>
                    <span>Marks: {quiz.totalMarks}</span>
                    {quiz._count && <span>Questions: {quiz._count.questions}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {quiz.status === "DRAFT" && (
                    <button
                      onClick={() => publishQuiz(quiz.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Delete this quiz?")) deleteQuiz(quiz.id);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          <span className="text-gray-400 text-sm">
            Page {page} of {data.meta.totalPages}
          </span>
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

export default QuizzesPage;
