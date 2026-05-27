"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
} from "@/store/api/mediaApi";
import Link from "next/link";

const PostsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPostsQuery({
    page,
    limit: 10,
    authorId: session?.user?.id,
  });
  const [deletePost] = useDeletePostMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const posts = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Posts</h1>
        <Link
          href="/dashboard/posts/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Create Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No posts found. Create your first post!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {post.title ?? "Untitled Post"}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {post.content ?? "No content"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Status: {post.status}</span>
                    <span>Type: {post.type}</span>
                    {post._count && (
                      <>
                        <span>Reactions: {post._count.reactions}</span>
                        <span>Comments: {post._count.comments}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this post?")) deletePost(post.id);
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                >
                  Delete
                </button>
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

export default PostsPage;
