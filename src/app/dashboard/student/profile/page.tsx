"use client";

import { useUser } from "@/hooks/useUser";
import { useGetStudentByIdQuery } from "@/store/api/studentApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;

  const { data: student, isLoading: sLoading } = useGetStudentByIdQuery(
    studentId!,
    { skip: !studentId },
  );

  if (isLoading || sLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;
  if (!student) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-2xl font-bold">
            {student.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{student.name}</h2>
            <p className="text-gray-400">{student.user.email}</p>
            <p className="text-gray-500 text-sm">{student.user.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs">Roll Number</p>
            <p className="text-white">{student.rollNumber || "--"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Class</p>
            <p className="text-white">{student.class || "--"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Board</p>
            <p className="text-white">{student.board || "--"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Institute</p>
            <p className="text-white">{student.institute || "--"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">City</p>
            <p className="text-white">{student.city || "--"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">State</p>
            <p className="text-white">{student.state || "--"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Attendance</p>
          <p className="text-3xl font-bold text-white mt-1">{student.attendanceRate}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Avg Score</p>
          <p className="text-3xl font-bold text-white mt-1">{student.averageScore}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Rank</p>
          <p className="text-3xl font-bold text-white mt-1">{student.rank ?? "--"}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Percentile</p>
          <p className="text-3xl font-bold text-white mt-1">{student.percentile ?? "--"}</p>
        </div>
      </div>

      {student.preferredSubjects?.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">Preferred Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {student.preferredSubjects.map((s: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
