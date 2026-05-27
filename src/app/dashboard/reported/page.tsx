"use client";

import { useState, useEffect, useCallback } from "react";

interface ReportedItem {
  id: string;
  type: string;
  reason: string;
  description?: string;
  status: string;
  reportedBy?: { id: string; name: string };
  targetId: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  REVIEWED: "bg-blue-500/20 text-blue-400",
  RESOLVED: "bg-green-500/20 text-green-400",
  DISMISSED: "bg-gray-500/20 text-gray-400",
};

const ReportedPage = () => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ReportedItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports?page=${page}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load reports.");
      setItems(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "dismiss" ? "DISMISSED" : "RESOLVED" }),
      });
      const json = await res.json();
      if (json.success) fetchReports();
    } catch {
      // handled
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !items.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Reported Content</h1>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status] || "bg-gray-500/20 text-gray-400"}`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                </div>
                <p className="text-white font-medium">{item.reason}</p>
                {item.description && (
                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {item.reportedBy && <span>Reported by: {item.reportedBy.name}</span>}
                  <span>Target: {item.targetId}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {item.status === "PENDING" && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleAction(item.id, "resolve")}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "dismiss")}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">No reported content.</div>
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

export default ReportedPage;
