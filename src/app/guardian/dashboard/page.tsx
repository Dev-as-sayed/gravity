"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useGetPaymentsQuery } from "@/store/api/paymentApi";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  class?: string | null;
  rollNumber?: string | null;
  attendanceRate: number;
  averageScore: number;
  profileImage?: string | null;
  _count?: {
    enrollments: number;
  };
}

const DashboardPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    if (!guardianId) return;
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStudents(res.data);
      })
      .finally(() => setLoadingStudents(false));
  }, [guardianId]);

  const studentIds = students.map((s) => s.id);

  const { data: enrollmentsData } = useGetEnrollmentsQuery(
    { studentId: studentIds },
    { skip: studentIds.length === 0 },
  );
  const { data: paymentsData } = useGetPaymentsQuery(
    { page: 1, limit: 5 },
    { skip: studentIds.length === 0 },
  );

  const loading = userLoading || loadingStudents;
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">No children linked to your account.</p>
      </div>
    );
  }

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];
  const payments = Array.isArray(paymentsData)
    ? paymentsData
    : paymentsData?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Welcome, {session?.user?.name || user?.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Linked Children</p>
          <p className="text-3xl font-bold text-white mt-1">{students.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Active Enrollments</p>
          <p className="text-3xl font-bold text-white mt-1">
            {enrollments.length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Avg Attendance</p>
          <p className="text-3xl font-bold text-white mt-1">
            {students.length > 0
              ? Math.round(
                  students.reduce((a, s) => a + (s.attendanceRate || 0), 0) /
                    students.length,
                )
              : 0}
            %
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Recent Payments</p>
          <p className="text-3xl font-bold text-white mt-1">
            {payments.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Children Overview</h2>
          {students.length === 0 ? (
            <p className="text-gray-400 text-sm">No children linked.</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <Link
                  key={student.id}
                  href={`/guardian/children`}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{student.name}</p>
                    <p className="text-gray-400 text-sm">
                      {student.class || "N/A"} | Roll: {student.rollNumber || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{student.averageScore}%</p>
                    <p className="text-gray-400 text-xs">Avg Score</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {payments.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div>
                    <p className="text-white text-sm">
                      Payment {payment.status}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-white font-semibold">
                    ${payment.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
