"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: string;
  totalMarks: number;
  dueDate: string;
  status: string;
  batch?: { id: string; name: string };
  _count?: { submissions: number };
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const AssignmentsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", batchId: "", type: "HOMEWORK", totalMarks: 20, dueDate: "" });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/assignments?page=${page}&limit=10`);
      const json: PaginatedResponse<Assignment> = await res.json();
      if (!json.success) throw new Error(json.data as any);
      setAssignments(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dueDate: new Date(form.dueDate).toISOString() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setShowModal(false);
      setForm({ title: "", description: "", batchId: "", type: "HOMEWORK", totalMarks: 20, dueDate: "" });
      fetchAssignments();
    } catch (err: any) {
      setError(err.message || "Failed to create assignment.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !assignments.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Assignments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Assignment
        </button>
      </div>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Title</th>
              <th className="pb-3">Batch</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Marks</th>
              <th className="pb-3">Due Date</th>
              <th className="pb-3">Submissions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{a.title}</td>
                <td className="py-3">{a.batch?.name || "—"}</td>
                <td className="py-3">{a.type}</td>
                <td className="py-3">{a.totalMarks}</td>
                <td className="py-3">{new Date(a.dueDate).toLocaleDateString()}</td>
                <td className="py-3">{a._count?.submissions ?? 0}</td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No assignments found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {meta && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <span>Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Create Assignment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                rows={3}
              />
              <input
                placeholder="Batch ID"
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                required
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
              >
                <option value="HOMEWORK">Homework</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="PROJECT">Project</option>
              </select>
              <input
                type="number"
                placeholder="Total Marks"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
              />
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
