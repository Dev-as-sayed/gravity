"use client";

import { useUser } from "@/hooks/useUser";
import { useGetStudentProgressQuery } from "@/store/api/studentApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;

  const { data: progress, isLoading: pLoading } = useGetStudentProgressQuery(
    studentId!,
    { skip: !studentId },
  );

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const overview = progress?.data?.overview;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Results</h1>

      {pLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : !overview ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No results available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Quizzes Taken</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalQuizzes}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Exams Taken</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalExams}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Avg Quiz Score</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.avgQuizScore ?? "--"}%</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Avg Exam Score</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.avgExamScore ?? "--"}%</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">Quiz Performance</h2>
              {progress?.data?.quizPerformance?.length > 0 ? (
                <div className="space-y-2">
                  {progress.data.quizPerformance.slice(0, 5).map((q: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{q.title || `Quiz ${i + 1}`}</span>
                      <span className="text-white">{q.score ?? q.percentage ?? "--"}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No quiz data.</p>
              )}
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">Exam Performance</h2>
              {progress?.data?.examPerformance?.length > 0 ? (
                <div className="space-y-2">
                  {progress.data.examPerformance.slice(0, 5).map((e: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{e.title || `Exam ${i + 1}`}</span>
                      <span className="text-white">{e.percentage ?? "--"}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No exam data.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
