"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGetNotesQuery } from "@/store/api/noteApi";
import {
  Search,
  BookOpen,
  ArrowRight,
  Download,
  Eye,
  ThumbsUp,
  GraduationCap,
  Loader2,
} from "lucide-react";

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-400",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-400",
  ADVANCED: "bg-red-500/10 text-red-400",
  EXPERT: "bg-purple-500/10 text-purple-400",
};

const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];
const difficulties = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

const NotesPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [searchInput, setSearchInput] = useState("");

  const filters: any = { page, limit: 12, sortBy: "createdAt", sortOrder: "desc", isPublic: true };
  if (search) filters.search = search;
  if (subject !== "All") filters.subject = subject;
  if (difficulty !== "All") filters.difficulty = difficulty;

  const { data, isLoading, error } = useGetNotesQuery(filters);

  const notes = data?.data ?? [];
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Study{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Notes
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Access comprehensive study notes, formula sheets, and revision material by India&apos;s best Physics educators.
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search notes by title, subject..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 space-y-4">
        {/* Subject filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => { setSubject(s); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                subject === s
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Difficulty filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                difficulty === d
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800/30 text-gray-500 hover:text-gray-300 border border-gray-700/30"
              }`}
            >
              {d === "All" ? "All Levels" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : error && !session ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Login to Access Notes</h2>
            <p className="text-gray-400 mb-6">Sign in to browse study notes and resources.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No notes found</h2>
            <p className="text-gray-400">
              {search ? "Try a different search term or filter." : "Check back later for new study material."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note: any) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.slug}`}
                  className="group bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs font-medium">
                        {note.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          difficultyColors[note.difficulty] || "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {(note.difficulty || "INTERMEDIATE").charAt(0) +
                          (note.difficulty || "INTERMEDIATE").slice(1).toLowerCase()}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition line-clamp-2">
                      {note.title}
                    </h3>
                    {note.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {note.description}
                      </p>
                    )}
                    {note.content && !note.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {note.content.replace(/<[^>]*>/g, "").slice(0, 150)}
                      </p>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-700/30 text-gray-500 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700/30">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {note.teacher?.name || "Unknown"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {note.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {note.downloads || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {note.likes || 0}
                        </span>
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
                {Array.from({ length: 5 }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, (meta.totalPages || 1) - 4));
                  const p = start + i;
                  if (p > (meta.totalPages || 1)) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        p === page
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (meta.totalPages || 1)}
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

export default NotesPage;
