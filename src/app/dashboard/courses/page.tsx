"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useDeleteCourseMutation,
} from "@/store/api/batchApi";

const CoursesPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", level: "BEGINNER", description: "", price: 0 });

  const { data, isLoading, error } = useGetCoursesQuery({ page, limit: 10 });
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(form).unwrap();
      setShowModal(false);
      setForm({ title: "", subject: "", level: "BEGINNER", description: "", price: 0 });
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
    return <div className="text-red-400 p-6">Failed to load courses.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Courses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Course
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="pb-3">Title</th>
              <th className="pb-3">Subject</th>
              <th className="pb-3">Level</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Batches</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((course) => (
              <tr key={course.id} className="border-b border-gray-700/30 text-gray-300">
                <td className="py-3">{course.title}</td>
                <td className="py-3">{course.subject}</td>
                <td className="py-3">{course.level}</td>
                <td className="py-3">{course.isFree ? "Free" : `₹${course.price}`}</td>
                <td className="py-3">{course.totalBatches ?? course._count?.batches ?? 0}</td>
                <td className="py-3">
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No courses found.</td>
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
            <h2 className="text-xl font-bold text-white mb-4">Create Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
                rows={3}
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400"
              />
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

export default CoursesPage;
