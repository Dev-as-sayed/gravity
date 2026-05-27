"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  class?: string | null;
}

interface Attendance {
  id: string;
  date: string;
  status: string;
  studentId: string;
  batchId: string;
}

const AttendancePage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance[]>>({});
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

        const map: Record<string, Attendance[]> = {};
        await Promise.all(
          studentList.map(async (s) => {
            const aRes = await fetch(`/api/attendance?studentId=${s.id}`);
            const aData = await aRes.json();
            if (aData.success) map[s.id] = aData.data;
          }),
        );
        setAttendanceMap(map);
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
        <p className="text-gray-400 text-center">Please login to view attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Attendance</h1>

      {students.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No children linked to your account.</p>
        </div>
      ) : (
        students.map((student) => {
          const records = attendanceMap[student.id] || [];
          const present = records.filter((r) => r.status === "PRESENT").length;
          const total = records.length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

          return (
            <div
              key={student.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {student.name}
                </h2>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{percentage}%</p>
                  <p className="text-gray-400 text-sm">
                    {present}/{total} days present
                  </p>
                </div>
              </div>

              {records.length === 0 ? (
                <p className="text-gray-400 text-sm">No attendance records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700/50">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="border-b border-gray-700/30">
                          <td className="py-2 text-white">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                record.status === "PRESENT"
                                  ? "bg-green-500/20 text-green-400"
                                  : record.status === "ABSENT"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {record.status}
                            </span>
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

export default AttendancePage;
