"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  certificateUrl?: string;
  type: string;
  description?: string;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((res) => setCertificates(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Certificates</h1>

      {certificates.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No certificates earned yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <div key={c.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <h3 className="text-white font-medium">{c.title}</h3>
              {c.description && <p className="text-gray-400 text-xs mt-1">{c.description}</p>}
              <p className="text-gray-500 text-xs mt-2">Issued: {new Date(c.issueDate).toLocaleDateString()}</p>
              {c.certificateUrl && (
                <a href={c.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-400 hover:underline text-sm">View Certificate</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
