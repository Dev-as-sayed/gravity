"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useGetLogsQuery } from "@/store/api/logApi";

const ACTION_OPTIONS = ["", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "RESOLVE", "ARCHIVE"];
const ENTITY_OPTIONS = ["", "POST", "COMMENT", "DOUBT", "USER", "BATCH", "EXAM", "QUIZ", "NOTE", "BLOG"];

const LogsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, error } = useGetLogsQuery({
    page,
    limit: 20,
    entity: entity || undefined,
    action: action || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-6">Failed to load activity logs.</div>;
  }

  const logs = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Entities</option>
            {ENTITY_OPTIONS.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Actions</option>
            {ACTION_OPTIONS.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
            />
          </div>
          <div>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
            />
          </div>
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
                <p className="text-gray-300 text-sm">{log.description || `${log.action} on ${log.entity}`}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {log.performedBy && <span>By: {log.performedBy.name}</span>}
                  <span>ID: {log.entityId}</span>
                  <span>{new Date(log.createdAt).toLocaleString(undefined, {
                    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-400">No activity logs found.</div>
        )}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">Page {page} of {data.meta.totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
