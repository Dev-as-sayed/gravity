"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  class?: string | null;
  rollNumber?: string | null;
  attendanceRate: number;
  averageScore: number;
  profileImage?: string | null;
  totalCourses: number;
  user: {
    email: string;
    phone: string;
  };
}

const ChildrenPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoading(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStudents(res.data);
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
        <p className="text-gray-400 text-center">Please login to view children.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Children</h1>

      {students.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">
            No children linked to your account. Contact the institute to link your children.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{student.name}</h3>
                  <p className="text-gray-400 text-sm">
                    Class: {student.class || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">Roll Number</p>
                  <p className="text-white font-medium">
                    {student.rollNumber || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">Courses</p>
                  <p className="text-white font-medium">
                    {student.totalCourses}
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">Attendance</p>
                  <p className="text-white font-medium">
                    {student.attendanceRate}%
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">Avg Score</p>
                  <p className="text-white font-medium">
                    {student.averageScore}%
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-gray-400 text-sm">{student.user.email}</p>
                <p className="text-gray-400 text-sm">{student.user.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildrenPage;
