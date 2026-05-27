"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useToggleNotePublicMutation,
} from "@/store/api/noteApi";
import Link from "next/link";

const NotesPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetNotesQuery({
    page,
    limit: 10,
    teacherId: session?.user?.id,
  });
  const [deleteNote] = useDeleteNoteMutation();
  const [togglePublic] = useToggleNotePublicMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const notes = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Notes</h1>
        <Link
          href="/dashboard/notes/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Upload Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No notes found. Upload your first note!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{note.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {note.description ?? "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Subject: {note.subject}</span>
                    <span>Downloads: {note.downloads}</span>
                    <span>Views: {note.views}</span>
                    <span>{note.isPublic ? "Public" : "Private"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublic(note.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      note.isPublic
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  >
                    {note.isPublic ? "Make Private" : "Make Public"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this note?")) deleteNote(note.id);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
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
          <span className="text-gray-400 text-sm">
            Page {page} of {data.meta.totalPages}
          </span>
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

export default NotesPage;
