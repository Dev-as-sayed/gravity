"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  subject?: string;
  batchId: string;
}

const AssignmentsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoadingData(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStudents(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [guardianId]);

  const studentIds = students.map((s) => s.id);
  const { data: enrollmentsData } = useGetEnrollmentsQuery(
    { studentId: studentIds },
    { skip: studentIds.length === 0 },
  );

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];

  const batchIds = [...new Set(enrollments.map((e: any) => e.batchId as string))] as string[];

  const [assignmentsMap, setAssignmentsMap] = useState<
    Record<string, Assignment[]>
  >({});
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    if (batchIds.length === 0) return;
    setLoadingAssignments(true);
    Promise.all(
      batchIds.map(async (batchId) => {
        try {
          const res = await fetch(`/api/assignments?batchId=${batchId}`);
          const data = await res.json();
          if (data.success) {
            setAssignmentsMap((prev) => ({
              ...prev,
              [batchId]: data.data,
            }));
          }
        } catch {}
      }),
    ).finally(() => setLoadingAssignments(false));
  }, [batchIds.join(",")]);

  const loading = userLoading || loadingData || loadingAssignments;

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
        <p className="text-gray-400 text-center">Please login to view assignments.</p>
      </div>
    );
  }

  const allAssignments = Object.values(assignmentsMap).flat();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Assignments</h1>

      {allAssignments.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No assignments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold">
                  {assignment.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    assignment.status === "SUBMITTED"
                      ? "bg-green-500/20 text-green-400"
                      : assignment.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
              {assignment.subject && (
                <p className="text-gray-400 text-sm mb-1">
                  Subject: {assignment.subject}
                </p>
              )}
              {assignment.description && (
                <p className="text-gray-400 text-sm mb-2">
                  {assignment.description}
                </p>
              )}
              <p className="text-gray-500 text-xs">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
