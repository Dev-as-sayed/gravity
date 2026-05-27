"use client";

import { useGetStudentsQuery } from "@/store/api/studentApi";
import { useGetEnrollmentStatsQuery } from "@/store/api/enrollmentApi";
import { useSession } from "next-auth/react";

const ProgressPage = () => {
  const { data: session } = useSession();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery({
    limit: 5,
    sortBy: "averageScore",
    sortOrder: "desc",
  });
  const { data: enrollmentStats, isLoading: enrollLoading } =
    useGetEnrollmentStatsQuery(undefined);

  const loading = studentsLoading || enrollLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const students = studentsData?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Student Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-white">
            {studentsData?.meta?.total ?? "--"}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Enrolled</h3>
          <p className="text-3xl font-bold text-white">
            {enrollmentStats?.data?.length ?? "--"}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Active</h3>
          <p className="text-3xl font-bold text-white">
            {students.filter((s) => s.user.isActive).length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Avg Score</h3>
          <p className="text-3xl font-bold text-white">
            {students.length > 0
              ? (
                  students.reduce((sum, s) => sum + s.averageScore, 0) /
                  students.length
                ).toFixed(1)
              : "--"}
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-gray-400 text-sm font-medium mb-4">Top Performers</h3>
        {students.length === 0 ? (
          <p className="text-gray-400">No student data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Avg Score</th>
                  <th className="pb-3 font-medium">Attendance</th>
                  <th className="pb-3 font-medium">Enrollments</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm">
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-gray-700/50">
                    <td className="py-3">{s.name}</td>
                    <td className="py-3 text-gray-400">{s.user.email}</td>
                    <td className="py-3">{s.averageScore.toFixed(1)}%</td>
                    <td className="py-3">{s.attendanceRate.toFixed(1)}%</td>
                    <td className="py-3">{s._count?.enrollments ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
