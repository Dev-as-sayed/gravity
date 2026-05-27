"use client";

import { useUser } from "@/hooks/useUser";
import {
  useGetStudentByIdQuery,
  useGetStudentProgressQuery,
} from "@/store/api/studentApi";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const studentId = user?.studentId;

  const { data: student, isLoading: studentLoading } = useGetStudentByIdQuery(
    studentId!,
    { skip: !studentId },
  );

  const { data: progress, isLoading: progressLoading } =
    useGetStudentProgressQuery(studentId!, { skip: !studentId });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetEnrollmentsQuery({ studentId }, { skip: !studentId });

  if (isLoading || studentLoading) return null;

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.data ?? [];
  const enrollmentCount = Array.isArray(enrollmentsData)
    ? enrollmentsData.length
    : (enrollmentsData as any)?.meta?.total ?? enrollments.length;

  return (
    <div className="space-y-6">
      {/* ================= PROFILE ================= */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white">
          Welcome {student?.name}
        </h1>
        <p className="text-gray-400 mt-1">{student?.user.email}</p>
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>Class: {student?.class || "--"}</span>
          <span>Board: {student?.board || "--"}</span>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Courses</p>
          <p className="text-3xl font-bold text-white mt-1">
            {student?.totalCourses ?? "--"}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Avg Score</p>
          <p className="text-3xl font-bold text-white mt-1">
            {student?.averageScore ?? "--"}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Attendance</p>
          <p className="text-3xl font-bold text-white mt-1">
            {student?.attendanceRate ?? "--"}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Enrollments</p>
          <p className="text-3xl font-bold text-white mt-1">
            {enrollmentCount}
          </p>
        </div>
      </div>

      {/* ================= PROGRESS ================= */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Progress</h2>
        {progressLoading ? (
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Quizzes Taken</p>
              <p className="text-xl font-bold text-white">
                {progress?.data?.overview?.totalQuizzes ?? 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Exams Taken</p>
              <p className="text-xl font-bold text-white">
                {progress?.data?.overview?.totalExams ?? 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Quiz Score</p>
              <p className="text-xl font-bold text-white">
                {progress?.data?.overview?.avgQuizScore ?? "--"}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Exam Score</p>
                <p className="text-xl font-bold text-white">
                  {progress?.data?.overview?.avgExamScore ?? "--"}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================= ENROLLMENTS ================= */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">My Batches</h2>
        {enrollmentsLoading ? (
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : enrollments.length === 0 ? (
          <p className="text-gray-400">No enrollments yet.</p>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enr: any) => (
              <div
                key={enr.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">
                    {enr.batch?.name || `Batch ${enr.batchId}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    Status: {enr.status} &middot; Progress:{" "}
                    {enr.progressPercentage ?? 0}%
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    enr.status === "APPROVED"
                      ? "bg-green-500/20 text-green-400"
                      : enr.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {enr.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
