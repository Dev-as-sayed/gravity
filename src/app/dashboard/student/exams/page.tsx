"use client";

import { useUser } from "@/hooks/useUser";
import { useGetExamsQuery } from "@/store/api/examApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const { data: examsData, isLoading: eLoading } = useGetExamsQuery({});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const exams = Array.isArray(examsData) ? examsData : (examsData as any)?.data ?? [];
  const now = new Date();
  const upcoming = exams.filter((e: any) => new Date(e.examDate) > now);
  const past = exams.filter((e: any) => new Date(e.examDate) <= now);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Exams</h1>

      {eLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-gray-400">No upcoming exams.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((exam: any) => (
                  <div key={exam.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{exam.title}</p>
                        <p className="text-sm text-gray-400">{exam.subject} &middot; {new Date(exam.examDate).toLocaleDateString()} &middot; {exam.fullMarks} marks</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400">{exam.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Past ({past.length})</h2>
            {past.length === 0 ? (
              <p className="text-gray-400">No past exams.</p>
            ) : (
              <div className="space-y-3">
                {past.map((exam: any) => (
                  <div key={exam.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{exam.title}</p>
                        <p className="text-sm text-gray-400">{exam.subject} &middot; {new Date(exam.examDate).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400">{exam.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
