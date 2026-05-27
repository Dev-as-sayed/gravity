"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
}

interface Fee {
  id: string;
  enrollmentId: string;
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  batchName?: string;
  batchSubject?: string;
}

const FeesPage = () => {
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

  const fees: Fee[] = enrollments.map((e: any) => ({
    id: e.id,
    enrollmentId: e.id,
    totalFees: e.totalFees || 0,
    paidAmount: e.paidAmount || 0,
    dueAmount: e.dueAmount || e.totalFees || 0,
    status: e.dueAmount && e.dueAmount > 0 ? "PENDING" : "PAID",
    batchName: e.batch?.name,
    batchSubject: e.batch?.subject,
  }));

  const loading = userLoading || loadingStudents || enrollmentsLoading;

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
        <p className="text-gray-400 text-center">Please login to view fee details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Fee Details</h1>

      {fees.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">
            No fee details available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700/50">
                <th className="text-left py-3 px-4">Batch</th>
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Total Fees</th>
                <th className="text-left py-3 px-4">Paid</th>
                <th className="text-left py-3 px-4">Due</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr
                  key={fee.id}
                  className="border-b border-gray-700/30"
                >
                  <td className="py-3 px-4 text-white">
                    {fee.batchName || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {fee.batchSubject || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-white">
                    ${fee.totalFees.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-green-400">
                    ${fee.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-red-400">
                    ${fee.dueAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        fee.status === "PAID"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {fee.status}
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
};

export default FeesPage;
