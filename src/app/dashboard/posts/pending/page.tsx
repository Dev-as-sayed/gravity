"use client";

import { useState } from "react";
import { useGetPostsQuery, useUpdatePostMutation } from "@/store/api/mediaApi";

const PendingPostsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPostsQuery({ status: "PENDING", page, limit: 10 });
  const [updatePost] = useUpdatePostMutation();

  const handleApprove = async (id: string) => {
    try {
      await updatePost({ id, data: { status: "PUBLISHED" } }).unwrap();
    } catch {
      // handled
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updatePost({ id, data: { status: "REJECTED" } }).unwrap();
    } catch {
      // handled
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const posts = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pending Posts</h1>

      {posts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No pending posts.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    {post.title ?? "Untitled"}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {post.content ?? "No content"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Type: {post.type}</span>
                    <span>Visibility: {post.visibility}</span>
                    {post.batch && <span>Batch: {post.batch.name}</span>}
                    {post.teacher && <span>By: {post.teacher.name}</span>}
                    {post.student && <span>By: {post.student.name}</span>}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingPostsPage;
