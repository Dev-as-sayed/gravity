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

  if (pLoading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const overview = progress?.data?.overview;
  const subjectPerformance = progress?.data?.subjectPerformance;
  const assignments = progress?.data?.assignments;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Progress</h1>

      {!overview ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No progress data available.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Quizzes</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalQuizzes}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Exams</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalExams}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Attendance</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalAttendance}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <p className="text-gray-400 text-sm">Assignments</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalAssignments}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">Subject Performance</h2>
              {subjectPerformance && subjectPerformance.length > 0 ? (
                <div className="space-y-3">
                  {subjectPerformance.map((s: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{s.subject}</span>
                        <span className="text-white">{s.average}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.average}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No subject data.</p>
              )}
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">Assignments</h2>
              {assignments && assignments.length > 0 ? (
                <div className="space-y-2">
                  {assignments.slice(0, 5).map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{a.title || `Assignment ${i + 1}`}</span>
                      <span className="text-white">{a.score ?? "--"}/{a.total ?? "--"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No assignments.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
