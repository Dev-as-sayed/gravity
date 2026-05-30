"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetTicketsQuery,
  useUpdateTicketMutation,
  useGetTicketStatsQuery,
} from "@/store/api/supportApi";

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
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data, isLoading, error } = useGetTicketsQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });
  const { data: stats } = useGetTicketStatsQuery();
  const [updateTicket] = useUpdateTicketMutation();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateTicket({ id, data: { status: status as any } }).unwrap();
    } catch {
      /* empty */
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
    return <div className="text-red-400 p-6">Failed to load support tickets.</div>;
  }

  const tickets = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
      </div>

      {stats?.data && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="text-white text-xl font-bold">{stats.data.total}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Open</p>
            <p className="text-red-400 text-xl font-bold">{stats.data.open}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">In Progress</p>
            <p className="text-blue-400 text-xl font-bold">{stats.data.inProgress}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Resolved</p>
            <p className="text-green-400 text-xl font-bold">{stats.data.resolved}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">High Priority</p>
            <p className="text-red-400 text-xl font-bold">{stats.data.byPriority?.find(p => p.priority === "HIGH")?._count || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

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
                    {ticket.status.replace("_", " ")}
                  </span>
                  {ticket.priority && (
                    <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{ticket.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {ticket.user && <span>By: {ticket.user.name}</span>}
                  <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                  {ticket.category && <span>Category: {ticket.category}</span>}
                </div>
              </div>
              {ticket.status !== "CLOSED" && (
                <div className="flex items-center gap-2 ml-4">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                    className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-xs"
                  >
                    <option value="OPEN">Open</option>
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
          <div className="text-center py-12 text-gray-400">No support tickets found.</div>
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

export default SupportPage;
