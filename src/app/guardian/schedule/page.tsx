"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetEnrollmentsQuery } from "@/store/api/enrollmentApi";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string;
  room?: string;
  batchId: string;
}

const SchedulePage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoadingStudents(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStudents(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingStudents(false));
  }, [guardianId]);

  const studentIds = students.map((s) => s.id);
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetEnrollmentsQuery(
      { studentId: studentIds },
      { skip: studentIds.length === 0 },
    );

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];

  const batchIds = [...new Set(enrollments.map((e: any) => e.batchId))];

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    if (batchIds.length === 0) return;
    setLoadingSchedules(true);
    Promise.all(
      batchIds.map(async (batchId) => {
        try {
          const res = await fetch(`/api/schedule?batchId=${batchId}`);
          const data = await res.json();
          if (data.success) return data.data;
        } catch {}
        return [];
      }),
    ).then((results) => {
      setSchedules(results.flat());
    })
    .finally(() => setLoadingSchedules(false));
  }, [batchIds.join(",")]);

  const loading = userLoading || loadingStudents || enrollmentsLoading || loadingSchedules;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view schedule.</p>
      </div>
    );
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Class Schedule</h1>

      {schedules.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No schedule available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700/50">
                <th className="text-left py-3 px-4">Day</th>
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Teacher</th>
                <th className="text-left py-3 px-4">Room</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const daySchedules = schedules.filter(
                  (s) => s.day.toLowerCase() === day.toLowerCase(),
                );
                if (daySchedules.length === 0) return null;
                return daySchedules.map((sched, idx) => (
                  <tr
                    key={`${day}-${idx}`}
                    className="border-b border-gray-700/30"
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={daySchedules.length}
                        className="py-3 px-4 text-white font-medium align-top"
                      >
                        {day}
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-300">
                      {sched.startTime} - {sched.endTime}
                    </td>
                    <td className="py-3 px-4 text-white">{sched.subject}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {sched.teacher || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {sched.room || "N/A"}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
