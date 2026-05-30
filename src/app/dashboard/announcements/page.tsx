"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementStatsQuery,
} from "@/store/api/announcementApi";

const AnnouncementsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const { data, isLoading, error } = useGetAnnouncementsQuery({ page, limit: 10 });
  const { data: stats } = useGetAnnouncementStatsQuery();
  const [createAnnouncement, { isLoading: creating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement({ title, content, isUrgent, isPinned }).unwrap();
      setTitle("");
      setContent("");
      setIsUrgent(false);
      setIsPinned(false);
      setShowForm(false);
    } catch {
      /* empty */
    }
  };

  const handleTogglePin = (id: string, pinned: boolean) => {
    updateAnnouncement({ id, data: { isPinned: !pinned } });
  };

  const handleToggleUrgent = (id: string, urgent: boolean) => {
    updateAnnouncement({ id, data: { isUrgent: !urgent } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-6">Failed to load announcements.</div>;
  }

  const announcements = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {stats?.data && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="text-white text-xl font-bold">{stats.data.total}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Pinned</p>
            <p className="text-white text-xl font-bold">{stats.data.pinned}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Urgent</p>
            <p className="text-white text-xl font-bold">{stats.data.urgent}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs">Total Views</p>
            <p className="text-white text-xl font-bold">{stats.data.totalViews}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="accent-red-500"
                />
                Mark as Urgent
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="accent-blue-500"
                />
                Pin Announcement
              </label>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {creating ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No announcements yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`bg-gray-800/50 rounded-xl p-6 border ${
                a.isPinned ? "border-blue-500/40" : a.isUrgent ? "border-red-500/40" : "border-gray-700/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isPinned && (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 font-medium">
                        Pinned
                      </span>
                    )}
                    {a.isUrgent && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 font-medium">
                        Urgent
                      </span>
                    )}
                    <h3 className="text-white font-semibold">{a.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{a.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    {a.createdBy && <span>By: {a.createdBy.name}</span>}
                    <span>{a.views} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleTogglePin(a.id, a.isPinned)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      a.isPinned ? "bg-yellow-600/20 text-yellow-400" : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {a.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => handleToggleUrgent(a.id, a.isUrgent)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      a.isUrgent ? "bg-red-600/20 text-red-400" : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {a.isUrgent ? "Normal" : "Urgent"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this announcement?")) deleteAnnouncement(a.id);
                    }}
                    className="px-2 py-1 rounded text-xs font-medium bg-red-600/20 text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default AnnouncementsPage;
