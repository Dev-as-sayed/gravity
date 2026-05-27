"use client";

import { useUser } from "@/hooks/useUser";
import { useGetQuizzesQuery } from "@/store/api/quizApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

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
            <div key={quiz.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
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
                {quiz.difficulty && <span>{quiz.difficulty}</span>}
              </div>
              {quiz._count?.questions !== undefined && (
                <p className="text-xs text-gray-500 mt-2">{quiz._count.questions} questions</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
