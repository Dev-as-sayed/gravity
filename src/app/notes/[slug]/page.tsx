"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGetNoteBySlugQuery } from "@/store/api/noteApi";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  Eye,
  ThumbsUp,
  Bookmark,
  GraduationCap,
  Loader2,
  FileText,
  File,
} from "lucide-react";

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-400",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-400",
  ADVANCED: "bg-red-500/10 text-red-400",
  EXPERT: "bg-purple-500/10 text-purple-400",
};

const NoteDetailPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const { data: session } = useSession();
  const { data: note, isLoading, error } = useGetNoteBySlugQuery(slug);
  const [likes, setLikes] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Note not found</p>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  const displayLikes = likes !== null ? likes : note.likes;
  const difficulty = note.difficulty || "INTERMEDIATE";

  const handleLike = async () => {
    if (!session) return;
    try {
      await fetch(`/api/notes/${note.id}/like`, { method: "POST" });
      setLikes(displayLikes + 1);
    } catch {}
  };

  const handleSave = async () => {
    if (!session) return;
    try {
      await fetch(`/api/notes/${note.id}/save`, { method: "POST" });
    } catch {}
  };

  const handleDownload = async () => {
    if (session) {
      try {
        await fetch(`/api/notes/${note.id}/download`, { method: "POST" });
      } catch {}
    }
    if (note.fileUrl) {
      window.open(note.fileUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notes
        </Link>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
              {note.subject || "Physics"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                difficultyColors[difficulty] || "bg-gray-500/10 text-gray-400"
              }`}
            >
              {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
            </span>
            {note.isPremium && (
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                Premium
              </span>
            )}
            {note.fileType && (
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1">
                <File className="w-3 h-3" />
                {note.fileType.toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {note.title}
          </h1>

          {note.description && (
            <p className="text-gray-400 text-lg mb-4">{note.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {note.teacher && (
              <div className="flex items-center gap-2">
                {note.teacher.profileImage ? (
                  <img
                    src={note.teacher.profileImage}
                    alt={note.teacher.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <span className="text-white font-medium">{note.teacher.name}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(note.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">{note.views || 0}</span> views
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <Download className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">{note.downloads || 0}</span> downloads
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <ThumbsUp className="w-4 h-4 text-red-400" />
            <span className="text-white font-medium">{displayLikes}</span> likes
          </span>
          {note.pages && (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">{note.pages}</span> pages
            </span>
          )}
        </div>

        {/* Topic & Tags */}
        {note.topic && (
          <div className="mb-4">
            <span className="text-gray-500 text-sm">Topic: </span>
            <span className="text-gray-300 text-sm">{note.topic}</span>
          </div>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/notes?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-800/50 text-gray-400 rounded-full text-xs hover:text-white border border-gray-700/50 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        {note.content && (
          <div
            className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4 mb-8"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {note.fileUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
            >
              <Download className="w-4 h-4" />
              {note.fileType === "pdf" ? "Download PDF" : "Download Resource"}
            </button>
          )}
          <button
            onClick={handleLike}
            disabled={!session}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition text-sm ${
              !session
                ? "bg-gray-800/30 border-gray-700/30 text-gray-500 cursor-not-allowed"
                : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-red-400 hover:border-red-500/30"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Like ({displayLikes})
          </button>
          <button
            onClick={handleSave}
            disabled={!session}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition text-sm ${
              !session
                ? "bg-gray-800/30 border-gray-700/30 text-gray-500 cursor-not-allowed"
                : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-blue-400 hover:border-blue-500/30"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* Login prompt for actions */}
        {!session && (
          <div className="mb-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">
              <Link href="/auth/login" className="text-purple-400 hover:underline">
                Sign in
              </Link>{" "}
              to like, save, or download notes.
            </p>
          </div>
        )}

        {/* Author Card */}
        {note.teacher && (
          <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="flex items-start gap-4">
              {note.teacher.profileImage ? (
                <img
                  src={note.teacher.profileImage}
                  alt={note.teacher.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {note.teacher.name}
                </h3>
                {note.teacher.qualification && (
                  <p className="text-gray-400 text-sm">
                    {note.teacher.qualification}
                  </p>
                )}
                {note.teacher.bio && (
                  <p className="text-gray-500 text-sm mt-2">{note.teacher.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default NoteDetailPage;
