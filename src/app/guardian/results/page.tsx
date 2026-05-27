"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  class?: string | null;
}

interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade?: string | null;
  exam?: {
    id: string;
    title: string;
    subject: string;
    date: string;
  };
}

const ResultsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, ExamResult[]>>({});
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

        const map: Record<string, ExamResult[]> = {};
        await Promise.all(
          studentList.map(async (s) => {
            const eRes = await fetch(`/api/exams/results?studentId=${s.id}`);
            const eData = await eRes.json();
            if (eData.success) map[s.id] = eData.data;
          }),
        );
        setResultsMap(map);
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
        <p className="text-gray-400 text-center">Please login to view results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Exam Results</h1>

      {students.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No children linked to your account.</p>
        </div>
      ) : (
        students.map((student) => {
          const results = resultsMap[student.id] || [];

          return (
            <div
              key={student.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {student.name}
              </h2>

              {results.length === 0 ? (
                <p className="text-gray-400 text-sm">No exam results available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700/50">
                        <th className="text-left py-2">Exam</th>
                        <th className="text-left py-2">Subject</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Score</th>
                        <th className="text-left py-2">Percentage</th>
                        <th className="text-left py-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-gray-700/30"
                        >
                          <td className="py-2 text-white">
                            {result.exam?.title || "N/A"}
                          </td>
                          <td className="py-2 text-gray-300">
                            {result.exam?.subject || "N/A"}
                          </td>
                          <td className="py-2 text-gray-300">
                            {result.exam?.date
                              ? new Date(result.exam.date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="py-2 text-white">
                            {result.score}/{result.totalMarks}
                          </td>
                          <td className="py-2">
                            <span
                              className={`font-medium ${
                                result.percentage >= 75
                                  ? "text-green-400"
                                  : result.percentage >= 50
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="py-2 text-gray-300">
                            {result.grade || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ResultsPage;
