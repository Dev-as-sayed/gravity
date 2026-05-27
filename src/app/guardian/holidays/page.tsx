"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Holiday {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
}

const HolidaysPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/holidays`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHolidays(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <p className="text-gray-400 text-center">Please login to view holidays.</p>
      </div>
    );
  }

  const upcoming = holidays.filter(
    (h) => new Date(h.date) >= new Date(),
  );
  const past = holidays.filter(
    (h) => new Date(h.date) < new Date(),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Holiday Schedule</h1>

      {holidays.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No holidays scheduled.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">
                Upcoming Holidays
              </h2>
              <div className="space-y-3">
                {upcoming.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {holiday.title}
                      </p>
                      {holiday.description && (
                        <p className="text-gray-400 text-sm">
                          {holiday.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {new Date(holiday.date).toLocaleDateString()}
                      </p>
                      <span className="text-xs text-blue-400">
                        {holiday.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">
                Past Holidays
              </h2>
              <div className="space-y-2">
                {past.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg"
                  >
                    <p className="text-gray-300">{holiday.title}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(holiday.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HolidaysPage;
