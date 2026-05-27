"use client";

import { useUser } from "@/hooks/useUser";
import { useGetNotesQuery } from "@/store/api/noteApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const { data: notesData, isLoading: notesLoading } = useGetNotesQuery({});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const notes = Array.isArray(notesData) ? notesData : (notesData as any)?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Notes</h1>

      {notesLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : notes.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No notes available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note: any) => (
            <div key={note.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
              <h3 className="text-white font-medium">{note.title}</h3>
              {note.description && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{note.description}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                {note.subject && <span>{note.subject}</span>}
                {note.fileType && <span>{note.fileType}</span>}
                {note.downloads !== undefined && <span>{note.downloads} downloads</span>}
              </div>
              {note.fileUrl && (
                <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-400 hover:underline text-sm">View / Download</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
