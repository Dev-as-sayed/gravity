"use client";

import { useUser } from "@/hooks/useUser";
import {
  useGetStudentByIdQuery,
  useGetStudentProgressQuery,
} from "@/store/api/studentApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const studentId = user?.studentId;

  const { data: student, isLoading: studentLoading } = useGetStudentByIdQuery(
    studentId!,
    {
      skip: !studentId,
    },
  );

  const { data: progress, isLoading: progressLoading } =
    useGetStudentProgressQuery(studentId!, {
      skip: !studentId,
    });

  if (isLoading || studentLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* ================= PROFILE ================= */}
      <div>
        <h1 className="text-2xl font-bold">Welcome {student?.name}</h1>
        <p>Email: {student?.user.email}</p>
        <p>Class: {student?.class}</p>
        <p>Board: {student?.board}</p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <p>Total Courses</p>
          <h2>{student?.totalCourses}</h2>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p>Average Score</p>
          <h2>{student?.averageScore}%</h2>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p>Attendance</p>
          <h2>{student?.attendanceRate}%</h2>
        </div>
      </div>

      {/* ================= PROGRESS ================= */}
      <div>
        <h2 className="text-xl font-semibold">Progress</h2>

        {progressLoading ? (
          <p>Loading progress...</p>
        ) : (
          <div className="space-y-2">
            <p>Avg Quiz Score: {progress?.data.overview.avgQuizScore}</p>
            <p>Avg Exam Score: {progress?.data.overview.avgExamScore}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
