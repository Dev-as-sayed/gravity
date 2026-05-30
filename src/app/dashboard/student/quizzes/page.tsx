"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useGetQuizzesQuery } from "@/store/api/quizApi";

const Page = () => {
  const { isLoading, isAuthenticated } = useUser();

  const { data: quizzesData, isLoading: qLoading } = useGetQuizzesQuery({});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const quizzes = Array.isArray(quizzesData) ? quizzesData : (quizzesData as any)?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Quizzes</h1>

      {qLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : quizzes.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No quizzes available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 flex flex-col">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-medium">{quiz.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    quiz.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" :
                    quiz.status === "ACTIVE" ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>{quiz.status}</span>
                </div>
                {quiz.description && <p className="text-gray-400 text-sm mt-1">{quiz.description}</p>}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  {quiz.subject && <span>{quiz.subject}</span>}
                  {quiz.totalMarks && <span>{quiz.totalMarks} marks</span>}
                  {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                  {quiz.difficulty && <span className="capitalize">{quiz.difficulty?.toLowerCase()}</span>}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {quiz._count?.questions !== undefined && (
                    <span>{quiz._count.questions} questions</span>
                  )}
                  {quiz._count?.attempts !== undefined && quiz._count.attempts > 0 && (
                    <span>{quiz._count.attempts} attempt(s)</span>
                  )}
                </div>
              </div>
              {quiz.status === "PUBLISHED" && (
                <Link
                  href={`/dashboard/student/quizzes/${quiz.id}`}
                  className="mt-4 w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Start Quiz
                </Link>
              )}
              {quiz.status !== "PUBLISHED" && (
                <div className="mt-4 w-full text-center py-2 bg-gray-700/50 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                  Not Available
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
