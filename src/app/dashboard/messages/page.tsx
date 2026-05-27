"use client";

import { useState, useEffect, useCallback } from "react";

interface Message {
  id: string;
  subject: string;
  content: string;
  sender?: { id: string; name: string };
  receiver?: { id: string; name: string };
  read: boolean;
  createdAt: string;
}

const MessagesPage = () => {
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/messages?page=${page}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load messages.");
      setMessages(json.data || []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !messages.length) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="grid gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-gray-800/50 rounded-xl p-6 border ${
              msg.read ? "border-gray-700/50" : "border-blue-500/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">{msg.subject}</h3>
                  {!msg.read && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{msg.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {msg.sender && <span>From: {msg.sender.name}</span>}
                  {msg.receiver && <span>To: {msg.receiver.name}</span>}
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">No messages.</div>
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

export default MessagesPage;
