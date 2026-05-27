"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useGetExamsQuery, useDeleteExamMutation } from "@/store/api/examApi";
import Link from "next/link";

const ExamsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetExamsQuery({
    page,
    limit: 10,
    teacherId: session?.user?.id,
  });
  const [deleteExam] = useDeleteExamMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const exams = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Exams</h1>
        <Link
          href="/dashboard/exams/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Create Exam
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No exams found. Create your first exam!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{exam.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {exam.description ?? "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Status: {exam.status}</span>
                    <span>Subject: {exam.subject}</span>
                    <span>Marks: {exam.fullMarks}</span>
                    <span>Date: {new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this exam?")) deleteExam(exam.id);
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                >
                  Delete
                </button>
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

export default ExamsPage;
