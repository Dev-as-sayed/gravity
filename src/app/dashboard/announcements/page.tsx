"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  batchId?: string;
  batchName?: string;
  createdAt: string;
}

const AnnouncementsPage = () => {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [batchId, setBatchId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        const json = await res.json();
        if (json.success) {
          setAnnouncements(json.data ?? []);
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, batchId: batchId || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        setAnnouncements((prev) => [json.data, ...prev]);
        setTitle("");
        setContent("");
        setBatchId("");
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
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Announcements</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6"
      >
        <h2 className="text-white font-semibold mb-4">New Announcement</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Batch ID (optional)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </form>

      {announcements.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No announcements yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">{a.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{a.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {a.batchName && <span>Batch: {a.batchName}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
