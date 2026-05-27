"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetEnrollmentsQuery,
  useUpdateEnrollmentStatusMutation,
  useDeleteEnrollmentMutation,
  useBulkEnrollmentActionMutation,
} from "@/store/api/enrollmentApi";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  APPROVED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
  WAITLISTED: "bg-blue-500/20 text-blue-400",
  CANCELLED: "bg-gray-500/20 text-gray-400",
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
  DROPPED: "bg-orange-500/20 text-orange-400",
};

const EnrollmentsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, error } = useGetEnrollmentsQuery({ page, limit: 10, status: statusFilter || undefined });
  const [updateStatus, { isLoading: updating }] = useUpdateEnrollmentStatusMutation();
  const [deleteEnrollment] = useDeleteEnrollmentMutation();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-6">Failed to load enrollments.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Enrollments</h1>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="COMPLETED">Completed</option>
          <option value="DROPPED">Dropped</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Student</th>
              <th className="pb-3">Batch</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data ?? data)?.map((enrollment: any) => (
              <tr key={enrollment.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{enrollment.student?.name || enrollment.studentId}</td>
                <td className="py-3">{enrollment.batch?.name || enrollment.batchId}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[enrollment.status] || "bg-gray-500/20 text-gray-400"}`}>
                    {enrollment.status}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${enrollment.paymentStatus === "COMPLETED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {enrollment.paymentStatus || "N/A"}
                  </span>
                </td>
                <td className="py-3">
                  <select
                    value={enrollment.status}
                    onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                    disabled={updating}
                    className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                    <option value="WAITLISTED">Waitlist</option>
                    <option value="COMPLETED">Complete</option>
                    <option value="DROPPED">Drop</option>
                    <option value="CANCELLED">Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
            {(!data?.data && !data) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No enrollments found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {data?.meta && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <span>Page {data.meta.page} of {data.meta.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={!data.meta.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsPage;
