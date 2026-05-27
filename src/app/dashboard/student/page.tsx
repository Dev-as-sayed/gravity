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
  const { data: enrollments } = useGetEnrollmentsQuery(
    { studentId },
    { skip: !studentId },
  );

  if (isLoading || studentLoading) return null;

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  const enrollmentCount = Array.isArray(enrollments)
    ? enrollments.length
    : enrollments?.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Welcome back, {student?.name || user?.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Enrolled Batches</p>
          <p className="text-3xl font-bold text-white mt-1">
            {enrollmentCount}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Avg Quiz Score</p>
          <p className="text-3xl font-bold text-white mt-1">
            {progressLoading ? "..." : `${progress?.data?.overview?.avgQuizScore ?? "--"}%`}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Avg Exam Score</p>
          <p className="text-3xl font-bold text-white mt-1">
            {progressLoading ? "..." : `${progress?.data?.overview?.avgExamScore ?? "--"}%`}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Attendance</p>
          <p className="text-3xl font-bold text-white mt-1">
            {student?.attendanceRate ?? "--"}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
