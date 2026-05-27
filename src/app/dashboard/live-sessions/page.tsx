"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
  platform: string;
  meetingUrl?: string;
  isLive: boolean;
  isCompleted: boolean;
  batch?: { id: string; name: string; subject: string };
  _count?: { attendees: number };
}

const LiveSessionsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", batchId: "", platform: "Zoom", meetingUrl: "", startTime: "", duration: 60 });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/live-sessions?page=${page}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load sessions.");
      setSessions(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load live sessions.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startTime: new Date(form.startTime).toISOString(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setShowModal(false);
      setForm({ title: "", description: "", batchId: "", platform: "Zoom", meetingUrl: "", startTime: "", duration: 60 });
      fetchSessions();
    } catch (err: any) {
      setError(err.message || "Failed to create session.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !sessions.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Live Sessions</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Session
        </button>
      </div>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Title</th>
              <th className="pb-3">Batch</th>
              <th className="pb-3">Platform</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Duration</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{s.title}</td>
                <td className="py-3">{s.batch?.name || "—"}</td>
                <td className="py-3">{s.platform}</td>
                <td className="py-3">{new Date(s.startTime).toLocaleDateString()}</td>
                <td className="py-3">{s.duration} min</td>
                <td className="py-3">
                  {s.isLive ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Live</span>
                  ) : s.isCompleted ? (
                    <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">Completed</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">Scheduled</span>
                  )}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No live sessions found.</td>
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
            <h2 className="text-xl font-bold text-white mb-4">Create Live Session</h2>
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
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="YouTube Live">YouTube Live</option>
              </select>
              <input
                placeholder="Meeting URL"
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
              />
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
                required
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
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

export default LiveSessionsPage;
