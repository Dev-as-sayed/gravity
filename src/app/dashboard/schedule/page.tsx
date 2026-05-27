"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ScheduleItem {
  id: string;
  title: string;
  type: "SESSION" | "EXAM" | "ASSIGNMENT" | "EVENT";
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  batchName?: string;
  status?: string;
}

const SchedulePage = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const [batchesRes, examsRes] = await Promise.all([
          fetch("/api/batches"),
          fetch("/api/exams"),
        ]);
        const batchesJson = await batchesRes.json();
        const examsJson = await examsRes.json();

        const schedule: ScheduleItem[] = [];

        (batchesJson.data ?? []).forEach((batch: any) => {
          if (batch.startDate) {
            schedule.push({
              id: `batch-${batch.id}`,
              title: batch.name,
              type: "SESSION",
              description: batch.description,
              date: batch.startDate,
              batchName: batch.name,
            });
          }
        });

        (examsJson.data ?? []).forEach((exam: any) => {
          schedule.push({
            id: `exam-${exam.id}`,
            title: exam.title,
            type: "EXAM",
            description: exam.description,
            date: exam.examDate,
            startTime: exam.startTime,
            endTime: exam.endTime,
            batchName: exam.batch?.name,
            status: exam.status,
          });
        });

        schedule.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        setItems(schedule);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Schedule</h1>

      {items.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No upcoming sessions or exams scheduled.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.type === "EXAM"
                          ? "bg-red-600/20 text-red-400"
                          : item.type === "SESSION"
                            ? "bg-blue-600/20 text-blue-400"
                            : item.type === "ASSIGNMENT"
                              ? "bg-yellow-600/20 text-yellow-400"
                              : "bg-green-600/20 text-green-400"
                      }`}
                    >
                      {item.type}
                    </span>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {item.description ?? "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>
                      {new Date(item.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {item.startTime && (
                      <span>
                        {item.startTime} - {item.endTime ?? "N/A"}
                      </span>
                    )}
                    {item.batchName && <span>Batch: {item.batchName}</span>}
                    {item.status && <span>Status: {item.status}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
