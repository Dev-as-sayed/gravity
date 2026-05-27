"use client";

import { useUser } from "@/hooks/useUser";
import { useGetNotesQuery } from "@/store/api/noteApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const { data: notesData, isLoading: notesLoading } = useGetNotesQuery({});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const notes = Array.isArray(notesData) ? notesData : (notesData as any)?.data ?? [];
  const practiceMaterials = notes.filter((n: any) => n.tags?.some((t: string) => t.toLowerCase().includes("practice")));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Practice Materials</h1>

      {notesLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : practiceMaterials.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No practice materials available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {practiceMaterials.map((item: any) => (
            <div key={item.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <h3 className="text-white font-medium">{item.title}</h3>
              {item.description && <p className="text-gray-400 text-sm mt-1">{item.description}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span>{item.subject}</span>
                <span>{item.difficulty}</span>
              </div>
              {item.fileUrl && (
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-400 hover:underline text-sm">Open</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
