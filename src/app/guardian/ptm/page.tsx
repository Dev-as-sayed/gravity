"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  class?: string | null;
}

interface PTM {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  teacherName?: string;
  status: string;
  studentId: string;
}

const PTMPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [ptmMap, setPtmMap] = useState<Record<string, PTM[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoading(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then(async (res) => {
        if (!res.success) return;
        const studentList: Student[] = res.data;
        setStudents(studentList);

        const map: Record<string, PTM[]> = {};
        await Promise.all(
          studentList.map(async (s) => {
            try {
              const pRes = await fetch(`/api/ptm?studentId=${s.id}`);
              const pData = await pRes.json();
              if (pData.success) map[s.id] = pData.data;
            } catch {}
          }),
        );
        setPtmMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [guardianId]);

  if (userLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view PTM schedule.</p>
      </div>
    );
  }

  const allPTMs = Object.values(ptmMap).flat();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Parent-Teacher Meetings
      </h1>

      {allPTMs.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">
            No parent-teacher meetings scheduled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPTMs.map((ptm) => (
            <div
              key={ptm.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold">{ptm.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ptm.status === "SCHEDULED"
                      ? "bg-blue-500/20 text-blue-400"
                      : ptm.status === "COMPLETED"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {ptm.status}
                </span>
              </div>
              {ptm.description && (
                <p className="text-gray-400 text-sm mb-2">{ptm.description}</p>
              )}
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  Date:{" "}
                  {new Date(ptm.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  Time: {ptm.startTime}
                  {ptm.endTime ? ` - ${ptm.endTime}` : ""}
                </p>
                {ptm.location && <p>Location: {ptm.location}</p>}
                {ptm.teacherName && (
                  <p className="text-gray-300">
                    Teacher: {ptm.teacherName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PTMPage;
