"use client";

import { useState } from "react";
import { useGetPostsQuery } from "@/store/api/mediaApi";

const CommentsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPostsQuery({ page, limit: 10 });
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const posts = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Comment Moderation</h1>

      {posts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No posts with comments.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div
                className="cursor-pointer"
                onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">
                      {post.title ?? "Untitled Post"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                      {post.content ?? "No content"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Comments: {post._count?.comments ?? 0}</div>
                    <div>Reactions: {post._count?.reactions ?? 0}</div>
                  </div>
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

export default CommentsPage;
