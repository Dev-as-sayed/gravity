"use client";

import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useGetBatchesQuery } from "@/store/api/batchApi";
import { useMemo } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;

  const { data: enrollmentsData } = useGetEnrollmentsQuery({ studentId }, { skip: !studentId });
  const { data: batchesData } = useGetBatchesQuery({}, {});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const enrolledBatchIds = useMemo(() => {
    const list = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData as any)?.data ?? [];
    return list.map((e: any) => e.batchId).filter(Boolean);
  }, [enrollmentsData]);

  const batches = useMemo(() => {
    const all = Array.isArray(batchesData) ? batchesData : (batchesData as any)?.data ?? [];
    return all.filter((b: any) => enrolledBatchIds.includes(b.id));
  }, [batchesData, enrolledBatchIds]);

  const schedule = useMemo(() => {
    const map: Record<string, any[]> = {};
    DAYS.forEach((d) => { map[d] = []; });
    batches.forEach((b: any) => {
      const sessions = b.sessions || [];
      sessions.forEach((s: any) => {
        (s.days || []).forEach((day: string) => {
          const dayName = day.charAt(0).toUpperCase() + day.slice(1);
          if (map[dayName]) {
            map[dayName].push({
              startTime: s.startTime,
              endTime: s.endTime,
              room: s.room,
              sessionName: s.name,
              batch: b,
            });
          }
        });
      });
    });
    return map;
  }, [batches]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Timetable</h1>

      {batches.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No batches enrolled. Timetable will appear once enrolled.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAYS.map((day) => (
            <div key={day} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-3">{day}</h3>
              {schedule[day].length === 0 ? (
                <p className="text-gray-500 text-sm">No classes</p>
              ) : (
                <div className="space-y-2">
                  {schedule[day].map((slot, idx) => (
                    <div key={idx} className="bg-gray-700/30 rounded-lg p-3 text-sm">
                      <p className="text-white font-medium">{slot.batch?.name || slot.subject}</p>
                      <p className="text-blue-400 text-xs">{slot.sessionName}</p>
                      <p className="text-gray-400">{slot.startTime} - {slot.endTime}</p>
                      {slot.room && <p className="text-gray-500 text-xs">{slot.room}</p>}
                    </div>
                  ))}
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
