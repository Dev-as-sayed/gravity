"use client";

import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description?: string;
  performedBy?: { id: string; name: string };
  metadata?: any;
  createdAt: string;
}

const LogsPage = () => {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ entity: "", action: "" });

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (filters.entity) params.set("entity", filters.entity);
    if (filters.action) params.set("action", filters.action);
    return params.toString();
  }, [page, filters]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/logs?${buildQuery()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load logs.");
      setLogs(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !logs.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Activity Logs</h1>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Entities</option>
            <option value="POST">Post</option>
            <option value="COMMENT">Comment</option>
            <option value="DOUBT">Doubt</option>
            <option value="USER">User</option>
            <option value="BATCH">Batch</option>
          </select>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="RESOLVE">Resolve</option>
          </select>
          <button
            onClick={() => { setPage(1); fetchLogs(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 uppercase font-mono">
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">{log.entity}</span>
                </div>
                <p className="text-gray-300 text-sm">{log.description || log.action}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {log.performedBy && <span>By: {log.performedBy.name}</span>}
                  <span>ID: {log.entityId}</span>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-400">No activity logs found.</div>
        )}
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

export default LogsPage;
