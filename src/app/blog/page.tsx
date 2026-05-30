"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGetBlogsQuery } from "@/store/api/blogApi";
import { Search, Clock, ArrowRight, BookOpen } from "lucide-react";

const categories = ["All", "Exam Strategy", "Physics Concepts", "Study Tips", "Motivation"];

const BlogPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [searchInput, setSearchInput] = useState("");

  const filters: any = { page, limit: 9, sortBy: "publishedAt", sortOrder: "desc" };
  if (search) filters.search = search;
  if (category !== "All") filters.category = category;

  const { data, isLoading, error } = useGetBlogsQuery(filters);

  const blogs = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Gravity{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Insights, study tips, and deep dives into Physics concepts from India&apos;s top educators.
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && !session ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Login to View Blogs</h2>
            <p className="text-gray-400 mb-6">Sign in to access articles and study resources.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No articles found</h2>
            <p className="text-gray-400">
              {search ? "Try a different search term." : "Check back later for new articles."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/30 transition-all"
                >
                  {blog.featuredImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {blog.categories?.slice(0, 2).map((cat: string) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {blog.readTime || 5} min read
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {blog.excerpt || blog.content?.slice(0, 150)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{blog.teacher?.name}</span>
                      <div className="flex items-center gap-3">
                        <span>{blog.views || 0} views</span>
                        <span>{blog.likes || 0} likes</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg disabled:opacity-40 hover:bg-gray-700/50 transition text-sm"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, page - 2);
                  const p = start + i;
                  if (p > meta.totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg disabled:opacity-40 hover:bg-gray-700/50 transition text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
