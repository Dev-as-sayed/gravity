"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetDoubtsQuery,
  useAssignTeacherMutation,
  useResolveDoubtMutation,
} from "@/store/api/doubtApi";

const statusColors: Record<string, string> = {
  OPEN: "bg-red-500/20 text-red-400",
  ANSWERED: "bg-blue-500/20 text-blue-400",
  RESOLVED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
  ESCALATED: "bg-orange-500/20 text-orange-400",
};

const priorityColors: Record<string, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
};

const DoubtsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const { data, isLoading, error } = useGetDoubtsQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const [assignTeacher] = useAssignTeacherMutation();
  const [resolveDoubt] = useResolveDoubtMutation();

  const handleAssign = async (id: string) => {
    if (!teacherId) return;
    try {
      await assignTeacher({ id, data: { teacherId } }).unwrap();
      setTeacherId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveDoubt({ id }).unwrap();
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
    return <div className="text-red-400 p-6">Failed to load doubts.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Doubts Queue</h1>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="ANSWERED">Answered</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="ESCALATED">Escalated</option>
        </select>
      </div>

      <div className="space-y-4">
        {data?.data?.map((doubt) => (
          <div key={doubt.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{doubt.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[doubt.status]}`}>
                    {doubt.status}
                  </span>
                  {doubt.priority && (
                    <span className={`text-xs font-medium ${priorityColors[doubt.priority]}`}>
                      {doubt.priority}
                    </span>
                  )}
                </div>
                {doubt.description && (
                  <p className="text-gray-400 text-sm mb-2">{doubt.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>By: {doubt.student?.name || doubt.studentId}</span>
                  {doubt.subject && <span>Subject: {doubt.subject}</span>}
                  {doubt.batch && <span>Batch: {doubt.batch.name}</span>}
                  <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                  {doubt._count && <span>{doubt._count.answers} answers</span>}
                  {doubt.assignedTo && doubt.teacher && (
                    <span>Assigned to: {doubt.teacher.name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {doubt.status === "OPEN" && (
                  <>
                    <input
                      placeholder="Teacher ID"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 text-xs w-28"
                    />
                    <button
                      onClick={() => handleAssign(doubt.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                    >
                      Assign
                    </button>
                  </>
                )}
                {(doubt.status === "ANSWERED" || doubt.status === "OPEN") && (
                  <button
                    onClick={() => handleResolve(doubt.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {(!data?.data || data.data.length === 0) && (
          <div className="text-center py-12 text-gray-400">No doubts found.</div>
        )}
      </div>

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
  );
};

export default DoubtsPage;
