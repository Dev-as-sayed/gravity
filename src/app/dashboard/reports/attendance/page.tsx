"use client";

import { useState, useEffect, useCallback } from "react";

interface AttendanceReport {
  id: string;
  date: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalStudents: number;
  batch?: { id: string; name: string; subject: string };
  rate: number;
}

const ReportsAttendancePage = () => {
  const [page, setPage] = useState(1);
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ batchId: "", dateFrom: "", dateTo: "" });

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");
    if (filters.batchId) params.set("batchId", filters.batchId);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params.toString();
  }, [page, filters]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/attendance/reports?${buildQuery()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load reports.");
      setReports(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load attendance reports.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !reports.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Attendance Reports</h1>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
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
            onClick={() => { setPage(1); fetchReports(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="p-4">Date</th>
              <th className="p-4">Batch</th>
              <th className="p-4">Present</th>
              <th className="p-4">Absent</th>
              <th className="p-4">Late</th>
              <th className="p-4">Total</th>
              <th className="p-4">Rate</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="p-4">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-4">{r.batch?.name || "—"}</td>
                <td className="p-4 text-green-400">{r.totalPresent}</td>
                <td className="p-4 text-red-400">{r.totalAbsent}</td>
                <td className="p-4 text-yellow-400">{r.totalLate}</td>
                <td className="p-4">{r.totalStudents}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${r.rate >= 80 ? "bg-green-500/20 text-green-400" : r.rate >= 60 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                    {r.rate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No attendance reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  );
};

export default ReportsAttendancePage;
