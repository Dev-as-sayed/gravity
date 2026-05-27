"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  batch?: { name: string; subject: string };
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/attendance?studentId=${studentId}`)
      .then((r) => r.json())
      .then((res) => setRecords(res?.data ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const present = records.filter((r) => r.status === "PRESENT").length;
  const total = records.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Attendance</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{total}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Present</p>
          <p className="text-3xl font-bold text-white mt-1">{present}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Rate</p>
          <p className="text-3xl font-bold text-white mt-1">{rate}%</p>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Records</h2>
        {records.length === 0 ? (
          <p className="text-gray-400">No attendance records found.</p>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <span className="text-white">{new Date(r.date).toLocaleDateString()}</span>
                <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                  r.status === "PRESENT" ? "bg-green-500/20 text-green-400" :
                  r.status === "ABSENT" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
