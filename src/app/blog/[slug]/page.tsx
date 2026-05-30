"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGetBlogBySlugQuery } from "@/store/api/blogApi";
import {
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  ArrowLeft,
  User,
  Loader2,
  MessageCircle,
  Send,
} from "lucide-react";

const BlogDetailPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const { data: session } = useSession();
  const { data: blog, isLoading, error } = useGetBlogBySlugQuery(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Article not found</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <div className="aspect-video rounded-xl overflow-hidden">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.categories?.map((cat: string) => (
              <span
                key={cat}
                className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {blog.teacher && (
              <div className="flex items-center gap-2">
                {blog.teacher.profileImage ? (
                  <img
                    src={blog.teacher.profileImage}
                    alt={blog.teacher.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <span className="text-white font-medium">{blog.teacher.name}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(blog.createdAt).toLocaleDateString("en-IN")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blog.readTime || 5} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {blog.views || 0} views
            </span>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-800/50 text-gray-400 rounded-full text-xs hover:text-white border border-gray-700/50 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-800">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-400 rounded-lg hover:text-blue-400 border border-gray-700/50 transition text-sm">
            <ThumbsUp className="w-4 h-4" />
            <span>{blog.likes || 0}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-400 rounded-lg hover:text-blue-400 border border-gray-700/50 transition text-sm">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Author Card */}
        {blog.teacher && (
          <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="flex items-start gap-4">
              {blog.teacher.profileImage ? (
                <img
                  src={blog.teacher.profileImage}
                  alt={blog.teacher.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {blog.teacher.name}
                </h3>
                {blog.teacher.qualification && (
                  <p className="text-gray-400 text-sm">
                    {blog.teacher.qualification}
                  </p>
                )}
                {blog.teacher.bio && (
                  <p className="text-gray-500 text-sm mt-2">{blog.teacher.bio}</p>
                )}
                {blog.teacher.expertise && blog.teacher.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {blog.teacher.expertise.map((exp: string) => (
                      <span
                        key={exp}
                        className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8" id="comments">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({blog._count?.comments || blog.comments?.length || 0})
          </h2>

          {/* Comment Form */}
          {session ? (
            <form
              className="mb-8"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;
                if (!content.trim()) return;
                try {
                  const res = await fetch(`/api/blogs/${blog.id}/comments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                  });
                  if (res.ok) {
                    form.reset();
                    window.location.reload();
                  }
                } catch {}
              }}
            >
              <textarea
                name="content"
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 text-center">
              <p className="text-gray-400 text-sm">
                <Link href="/auth/login" className="text-blue-400 hover:underline">
                  Sign in
                </Link>{" "}
                to leave a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          {blog.comments && blog.comments.length > 0 ? (
            <div className="space-y-4">
              {blog.comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">
                          {comment.name || comment.email || "Anonymous"}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {new Date(comment.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;
