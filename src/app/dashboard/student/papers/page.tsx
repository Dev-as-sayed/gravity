"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Paper {
  id: string;
  title: string;
  year?: number;
  subject: string;
  fileUrl?: string;
  description?: string;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/papers")
      .then((r) => r.json())
      .then((res) => setPapers(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Previous Year Papers</h1>

      {papers.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No papers available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((p) => (
            <div key={p.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <h3 className="text-white font-medium">{p.title}</h3>
              {p.description && <p className="text-gray-400 text-sm mt-1">{p.description}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span>{p.subject}</span>
                {p.year && <span>{p.year}</span>}
              </div>
              {p.fileUrl && (
                <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Download</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
