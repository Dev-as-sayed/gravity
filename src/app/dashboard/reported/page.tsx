"use client";

import { useState, useEffect, useCallback } from "react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  REVIEWED: "bg-blue-500/20 text-blue-400",
  ACTION_TAKEN: "bg-green-500/20 text-green-400",
  DISMISSED: "bg-gray-500/20 text-gray-400",
};

const ReportedPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/reported?${params}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        setMeta(json.meta || null);
      }
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (id: string, status: string) => {
    try {
      await fetch(`/api/reported/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchReports();
    } catch { /* empty */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Reported Content</h1>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTION_TAKEN">Action Taken</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status] || "bg-gray-500/20 text-gray-400"}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-white font-medium">{item.reason || "Reported content"}</p>
                <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Target: {item.targetId || item.entityId}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {item.status === "PENDING" && (
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleAction(item.id, "ACTION_TAKEN")} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium">Resolve</button>
                  <button onClick={() => handleAction(item.id, "DISMISSED")} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium">Dismiss</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-center py-12 text-gray-400">No reported content.</div>}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm">Previous</button>
          <span className="text-gray-400 text-sm">Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages} className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm">Next</button>
        </div>
      )}
    </div>
  );
};

export default ReportedPage;
