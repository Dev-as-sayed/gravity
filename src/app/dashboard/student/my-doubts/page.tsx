"use client";

import { useUser } from "@/hooks/useUser";
import { useGetDoubtsQuery } from "@/store/api/doubtApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;

  const { data: doubtsData, isLoading: dLoading } = useGetDoubtsQuery(
    {},
  );

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const doubts = Array.isArray(doubtsData) ? doubtsData : (doubtsData as any)?.data ?? [];

  const statusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-yellow-500/20 text-yellow-400";
      case "ANSWERED": return "bg-blue-500/20 text-blue-400";
      case "RESOLVED": return "bg-green-500/20 text-green-400";
      case "CLOSED": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Doubts</h1>

      {dLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : doubts.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No doubts raised yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doubts.map((d: any) => (
            <div key={d.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{d.title}</h3>
                  {d.description && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{d.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {d.subject && <span>{d.subject}</span>}
                    {d.topic && <span>{d.topic}</span>}
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    {d._count?.answers !== undefined && <span>{d._count.answers} answers</span>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(d.status)}`}>{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
