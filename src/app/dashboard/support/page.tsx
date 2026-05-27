"use client";

import { useState, useEffect, useCallback } from "react";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-red-500/20 text-red-400",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400",
  RESOLVED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
};

const priorityColors: Record<string, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
};

const SupportPage = () => {
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/support?page=${page}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load tickets.");
      setTickets(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) fetchTickets();
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

  if (error && !tickets.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Support Tickets</h1>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{ticket.subject}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[ticket.status] || "bg-gray-500/20 text-gray-400"}`}>
                    {ticket.status}
                  </span>
                  {ticket.priority && (
                    <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{ticket.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {ticket.createdBy && <span>By: {ticket.createdBy.name}</span>}
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
                <div className="flex items-center gap-2 ml-4">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleStatusUpdate(ticket.id, e.target.value);
                    }}
                    className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-xs"
                  >
                    <option value="" disabled>Update</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-400">No support tickets.</div>
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

export default SupportPage;
