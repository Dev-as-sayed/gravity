"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useDeleteBatchMutation,
  type BatchSession,
} from "@/store/api/batchApi";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

interface SessionEntry {
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
}

const BatchesPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", courseId: "", mode: "ONLINE", startDate: "", maxStudents: 30, price: 0 });
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  const { data, isLoading, error } = useGetBatchesQuery({ page, limit: 10 });
  const [createBatch, { isLoading: creating }] = useCreateBatchMutation();
  const [deleteBatch] = useDeleteBatchMutation();

  const toggleDay = (idx: number, day: string) => {
    setSessions((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, days: s.days.includes(day) ? s.days.filter((d) => d !== day) : [...s.days, day] }
          : s,
      ),
    );
  };

  const addSession = () => {
    setSessions((prev) => [...prev, { name: "", days: [], startTime: "08:00", endTime: "10:00" }]);
  };

  const removeSession = (idx: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBatch({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        sessions: sessions.filter((s) => s.name && s.days.length > 0),
      }).unwrap();
      setShowModal(false);
      setForm({ name: "", subject: "", courseId: "", mode: "ONLINE", startDate: "", maxStudents: 30, price: 0 });
      setSessions([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-6">Failed to load batches.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Batches</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Batch
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Name</th>
              <th className="pb-3">Subject</th>
              <th className="pb-3">Mode</th>
              <th className="pb-3">Students</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((batch) => (
              <tr key={batch.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{batch.name}</td>
                <td className="py-3">{batch.subject}</td>
                <td className="py-3">{batch.mode}</td>
                <td className="py-3">{batch.currentEnrollments}/{batch.maxStudents || "∞"}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${batch.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {batch.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 flex gap-3">
                  <Link
                    href={`/dashboard/batches/${batch.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deleteBatch(batch.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No batches found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {data?.meta && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <span>Page {data.meta.page} of {data.meta.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={!data.meta.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Create Batch</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                required
              />
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                required
              />
              <input
                placeholder="Course ID"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                required
              />
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
                required
              />
              <input
                type="number"
                placeholder="Max Students"
                value={form.maxStudents}
                onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
              />

              {/* Sessions */}
              <div className="border-t border-gray-700/50 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Sessions</span>
                  <button
                    type="button"
                    onClick={addSession}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Add Session
                  </button>
                </div>
                {sessions.map((s, idx) => (
                  <div key={idx} className="bg-gray-700/30 rounded-lg p-3 mb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        placeholder="Session name (e.g. Morning)"
                        value={s.name}
                        onChange={(e) =>
                          setSessions((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)),
                          )
                        }
                        className="flex-1 px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSession(idx)}
                        className="ml-2 text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">Start</label>
                        <input
                          type="time"
                          value={s.startTime}
                          onChange={(e) =>
                            setSessions((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, startTime: e.target.value } : x)),
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">End</label>
                        <input
                          type="time"
                          value={s.endTime}
                          onChange={(e) =>
                            setSessions((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, endTime: e.target.value } : x)),
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => (
                        <label key={day} className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={s.days.includes(day)}
                            onChange={() => toggleDay(idx, day)}
                            className="accent-blue-500"
                          />
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;
