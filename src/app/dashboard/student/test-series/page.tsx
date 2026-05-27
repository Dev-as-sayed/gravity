"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface TestSeries {
  id: string;
  title: string;
  description?: string;
  subject: string;
  totalTests: number;
  completedTests: number;
  averageScore?: number;
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/test-series")
      .then((r) => r.json())
      .then((res) => setSeries(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Test Series</h1>

      {series.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No test series available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((ts) => (
            <div key={ts.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <h3 className="text-white font-medium">{ts.title}</h3>
              {ts.description && <p className="text-gray-400 text-sm mt-1">{ts.description}</p>}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                <span>{ts.subject}</span>
                <span>{ts.completedTests}/{ts.totalTests} done</span>
              </div>
              {ts.averageScore !== undefined && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${ts.averageScore}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Avg score: {ts.averageScore}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
