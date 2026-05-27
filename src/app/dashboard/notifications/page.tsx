"use client";

import { useState, useEffect, useCallback } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  audience: string;
  sentAt: string;
  sentBy?: { id: string; name: string };
}

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  const [audience, setAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/notifications?page=${page}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load notifications.");
      setNotifications(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type, audience }),
      });
      const json = await res.json();
      if (json.success) {
        setTitle("");
        setMessage("");
        setType("INFO");
        setAudience("ALL");
        fetchNotifications();
      }
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
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
      <h1 className="text-2xl font-bold text-white mb-6">Notifications</h1>

      <form
        onSubmit={handleSend}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6"
      >
        <h2 className="text-white font-semibold mb-4">Send Notification</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <div className="flex gap-4">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ALERT">Alert</option>
              <option value="PROMOTION">Promotion</option>
            </select>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="ALL">All</option>
              <option value="STUDENT">Students</option>
              <option value="TEACHER">Teachers</option>
              <option value="MODERATOR">Moderators</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="grid gap-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">{n.title}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-600/50 text-gray-300 uppercase">
                    {n.type}
                  </span>
                  <span className="text-xs text-gray-500">{n.audience}</span>
                </div>
                <p className="text-gray-400 text-sm">{n.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {n.sentBy && <span>Sent by: {n.sentBy.name}</span>}
                  <span>{new Date(n.sentAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">No notifications sent yet.</div>
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

export default NotificationsPage;
