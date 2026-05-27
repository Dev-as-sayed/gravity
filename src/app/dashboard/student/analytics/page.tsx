"use client";

import { useUser } from "@/hooks/useUser";
import { useGetStudentProgressQuery } from "@/store/api/studentApi";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;

  const { data: progress, isLoading: pLoading } = useGetStudentProgressQuery(
    studentId!,
    { skip: !studentId },
  );
  const { data: enrollmentsData } = useGetEnrollmentsQuery(
    { studentId },
    { skip: !studentId },
  );

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (pLoading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const overview = progress?.data?.overview;
  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.data ?? [];

  const quizScore = overview?.avgQuizScore ?? 0;
  const examScore = overview?.avgExamScore ?? 0;
  const overall = Math.round((quizScore + examScore) / 2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Overall Score</p>
          <p className="text-3xl font-bold text-white mt-1">{overview ? `${overall}%` : "--"}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Quiz Avg</p>
          <p className="text-3xl font-bold text-white mt-1">{quizScore}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Exam Avg</p>
          <p className="text-3xl font-bold text-white mt-1">{examScore}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Enrollments</p>
          <p className="text-3xl font-bold text-white mt-1">{enrollments.length}</p>
        </div>
      </div>

      {overview && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Performance Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Quiz Performance</span>
                <span className="text-white">{quizScore}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${quizScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Exam Performance</span>
                <span className="text-white">{examScore}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${examScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Overall</span>
                <span className="text-white">{overall}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${overall}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
