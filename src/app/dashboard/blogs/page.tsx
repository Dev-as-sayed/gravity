"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetBlogsQuery,
  useDeleteBlogMutation,
  usePublishBlogMutation,
} from "@/store/api/blogApi";
import Link from "next/link";

const BlogsPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetBlogsQuery({
    page,
    limit: 10,
    teacherId: session?.user?.id,
  });
  const [deleteBlog] = useDeleteBlogMutation();
  const [publishBlog] = usePublishBlogMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const blogs = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Blogs</h1>
        <Link
          href="/dashboard/blogs/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Create Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No blogs found. Create your first blog!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{blog.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {blog.excerpt ?? "No excerpt"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>{blog.isPublished ? "Published" : "Draft"}</span>
                    <span>Views: {blog.views}</span>
                    <span>Likes: {blog.likes}</span>
                    {blog.categories.length > 0 && (
                      <span>Categories: {blog.categories.join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!blog.isPublished && (
                    <button
                      onClick={() => publishBlog(blog.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Delete this blog?")) deleteBlog(blog.id);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                  >
                    Delete
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

export default BlogsPage;
