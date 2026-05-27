"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetStudentsQuery,
  useToggleStudentStatusMutation,
} from "@/store/api/studentApi";

const StudentsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useGetStudentsQuery({ page, limit: 10, search: search || undefined });
  const [toggleStatus] = useToggleStudentStatusMutation();

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleStatus({ id, isActive: !current }).unwrap();
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
    return <div className="text-red-400 p-6">Failed to load students.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Students</h1>

      <div className="mb-4">
        <input
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
        />
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((student) => (
              <tr key={student.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{student.name}</td>
                <td className="py-3">{student.user.email}</td>
                <td className="py-3">{student.user.phone}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${student.user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {student.user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleToggle(student.id, student.user.isActive)}
                    className={`text-sm ${student.user.isActive ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}`}
                  >
                    {student.user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  {search ? "No students match your search." : "No students found."}
                </td>
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
    </div>
  );
};

export default StudentsPage;
