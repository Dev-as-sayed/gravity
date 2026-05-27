"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  startTime?: string;
  endTime?: string;
  totalMarks: number;
  batchId: string;
  status: string;
}

const ExamsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoadingStudents(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStudents(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingStudents(false));
  }, [guardianId]);

  const studentIds = students.map((s) => s.id);
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetEnrollmentsQuery(
      { studentId: studentIds },
      { skip: studentIds.length === 0 },
    );

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];

  const batchIds = [...new Set(enrollments.map((e: any) => e.batchId))];

  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  useEffect(() => {
    if (batchIds.length === 0) return;
    setLoadingExams(true);
    Promise.all(
      batchIds.map(async (batchId) => {
        try {
          const res = await fetch(`/api/exams?batchId=${batchId}`);
          const data = await res.json();
          if (data.success) return data.data;
        } catch {}
        return [];
      }),
    )
      .then((results) => {
        const all = results.flat();
        all.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setExams(all);
      })
      .finally(() => setLoadingExams(false));
  }, [batchIds.join(",")]);

  const loading = userLoading || loadingStudents || enrollmentsLoading || loadingExams;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view exams.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Upcoming Exams</h1>

      {exams.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">
            No upcoming exams scheduled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold">{exam.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    exam.status === "UPCOMING"
                      ? "bg-blue-500/20 text-blue-400"
                      : exam.status === "ONGOING"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {exam.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Subject: {exam.subject}</p>
              <p className="text-gray-400 text-sm">
                Date: {new Date(exam.date).toLocaleDateString()}
              </p>
              {exam.startTime && (
                <p className="text-gray-400 text-sm">
                  Time: {exam.startTime}
                  {exam.endTime ? ` - ${exam.endTime}` : ""}
                </p>
              )}
              <p className="text-gray-400 text-sm">
                Total Marks: {exam.totalMarks}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
