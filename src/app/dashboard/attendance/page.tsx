"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number;
  student?: { id: string; name: string; profileImage?: string };
  batch?: { id: string; name: string; subject: string };
}

const statusColors: Record<string, string> = {
  PRESENT: "bg-green-500/20 text-green-400",
  ABSENT: "bg-red-500/20 text-red-400",
  LATE: "bg-yellow-500/20 text-yellow-400",
  HALF_DAY: "bg-orange-500/20 text-orange-400",
  LEAVE: "bg-blue-500/20 text-blue-400",
};

const AttendancePage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ studentId: "", batchId: "", dateFrom: "", dateTo: "" });

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (filters.studentId) params.set("studentId", filters.studentId);
    if (filters.batchId) params.set("batchId", filters.batchId);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params.toString();
  }, [page, filters]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/attendance?${buildQuery()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load attendance.");
      setRecords(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !records.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Attendance</h1>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            placeholder="Student ID"
            value={filters.studentId}
            onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 text-sm"
          />
          <input
            placeholder="Batch ID"
            value={filters.batchId}
            onChange={(e) => setFilters({ ...filters, batchId: e.target.value })}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 text-sm"
          />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          />
          <button
            onClick={() => { setPage(1); fetchRecords(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Student</th>
              <th className="pb-3">Batch</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Check In</th>
              <th className="pb-3">Check Out</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{r.student?.name || r.student?.id || "—"}</td>
                <td className="py-3">{r.batch?.name || "—"}</td>
                <td className="py-3">{new Date(r.date).toLocaleDateString()}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[r.status] || "bg-gray-500/20 text-gray-400"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3">{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "—"}</td>
                <td className="py-3">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "—"}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No attendance records found.</td>
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
    </div>
  );
};

export default AttendancePage;
