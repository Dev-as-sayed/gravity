"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  class?: string | null;
  averageScore: number;
  attendanceRate: number;
}

interface Progress {
  overview: {
    totalQuizzes: number;
    totalExams: number;
    totalAttendance: number;
    totalAssignments: number;
    avgQuizScore: number;
    avgExamScore: number;
  };
  subjectPerformance?: Array<{ subject: string; average: number }>;
}

const ProgressPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoading(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then(async (res) => {
        if (!res.success) return;
        const studentList: Student[] = res.data;
        setStudents(studentList);

        const map: Record<string, Progress> = {};
        await Promise.all(
          studentList.map(async (s) => {
            try {
              const pRes = await fetch(`/api/students/${s.id}/progress`);
              const pData = await pRes.json();
              if (pData.success) map[s.id] = pData.data;
            } catch {}
          }),
        );
        setProgressMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [guardianId]);

  if (userLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Progress Reports</h1>

      {students.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No children linked to your account.</p>
        </div>
      ) : (
        students.map((student) => {
          const progress = progressMap[student.id];

          return (
            <div
              key={student.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {student.name}
              </h2>

              {!progress ? (
                <p className="text-gray-400 text-sm">No progress data available.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Quizzes</p>
                      <p className="text-white font-bold text-lg">
                        {progress.overview.totalQuizzes}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Exams</p>
                      <p className="text-white font-bold text-lg">
                        {progress.overview.totalExams}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Assignments</p>
                      <p className="text-white font-bold text-lg">
                        {progress.overview.totalAssignments}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Avg Quiz</p>
                      <p className="text-white font-bold text-lg">
                        {progress.overview.avgQuizScore}%
                      </p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Avg Exam</p>
                      <p className="text-white font-bold text-lg">
                        {progress.overview.avgExamScore}%
                      </p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Attendance</p>
                      <p className="text-white font-bold text-lg">
                        {progress.overview.totalAttendance}
                      </p>
                    </div>
                  </div>

                  {progress.subjectPerformance &&
                    progress.subjectPerformance.length > 0 && (
                      <div>
                        <h3 className="text-white font-medium mb-2">
                          Subject Performance
                        </h3>
                        <div className="space-y-2">
                          {progress.subjectPerformance.map((subj, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-700/20 rounded-lg px-4 py-2"
                            >
                              <span className="text-gray-300">
                                {subj.subject}
                              </span>
                              <span
                                className={`font-semibold ${
                                  subj.average >= 75
                                    ? "text-green-400"
                                    : subj.average >= 50
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {subj.average}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProgressPage;
