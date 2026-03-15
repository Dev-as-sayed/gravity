// src/app/media/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  Headphones,
  Image,
  File,
  Newspaper,
  TrendingUp,
  Clock,
  PlayCircle,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  Calendar,
  Search,
  Filter,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useGetPostsQuery, useGetMediaStatsQuery } from "@/store/api/mediaApi";

// Category mapping
const categories = [
  {
    name: "Videos",
    type: "VIDEO",
    icon: Film,
    color: "from-blue-500 to-cyan-500",
    count: 245,
  },
  {
    name: "Podcasts",
    type: "AUDIO",
    icon: Headphones,
    color: "from-purple-500 to-pink-500",
    count: 89,
  },
  {
    name: "Images",
    type: "IMAGE",
    icon: Image,
    color: "from-green-500 to-emerald-500",
    count: 156,
  },
  {
    name: "Documents",
    type: "PDF",
    icon: File,
    color: "from-orange-500 to-red-500",
    count: 203,
  },
  {
    name: "Blog Posts",
    type: "TEXT",
    icon: Newspaper,
    color: "from-indigo-500 to-blue-500",
    count: 178,
  },
];

export default function MediaHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch featured/popular posts
  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetPostsQuery({
    page: 1,
    limit: 6,
    isFeatured: true,
    status: "PUBLISHED",
    sortBy: "views",
    sortOrder: "desc",
  });

  // Fetch latest posts
  const { data: latestData, isLoading: latestLoading } = useGetPostsQuery({
    page: 1,
    limit: 3,
    status: "PUBLISHED",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch media statistics
  const { data: statsData, isLoading: statsLoading } = useGetMediaStatsQuery();

  const featuredPosts = featuredData?.data || [];
  const latestPosts = latestData?.data || [];
  const stats = statsData?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/media/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return (
          <Film className="w-12 h-12 text-white/50 group-hover:text-blue-400 transition-colors" />
        );
      case "AUDIO":
        return (
          <Headphones className="w-12 h-12 text-white/50 group-hover:text-purple-400 transition-colors" />
        );
      case "IMAGE":
        return (
          <Image className="w-12 h-12 text-white/50 group-hover:text-green-400 transition-colors" />
        );
      case "PDF":
        return (
          <File className="w-12 h-12 text-white/50 group-hover:text-orange-400 transition-colors" />
        );
      default:
        return (
          <Newspaper className="w-12 h-12 text-white/50 group-hover:text-blue-400 transition-colors" />
        );
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views.toString();
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search videos, lectures, podcasts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </form>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 p-8">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gravity Media
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mb-6">
            Explore our extensive collection of physics lectures, podcasts,
            visual content, and educational materials. Learn from expert faculty
            anytime, anywhere.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/media/videos"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Start Watching
            </Link>
            <Link
              href="/media/latest"
              className="px-6 py-2 border border-white/20 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            >
              Browse Latest
            </Link>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/media?type=${category.type}`}
                className="group relative overflow-hidden rounded-xl bg-gray-900/50 border border-white/10 p-4 hover:border-white/20 transition-all hover:scale-105"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                <Icon className="w-8 h-8 text-white mb-2" />
                <h3 className="text-white font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}+ items</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Media */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Featured Content
          </h2>
          <Link
            href="/media?isFeatured=true"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All
          </Link>
        </div>

        {featuredLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : featuredError ? (
          <div className="flex items-center justify-center py-12 text-red-400">
            <AlertCircle className="w-8 h-8 mr-2" />
            Failed to load featured content
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/media/${post.id}`}
                className="group relative bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:scale-105 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getMediaIcon(post.type)}
                  </div>
                  {post.type === "VIDEO" && post.metadata?.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                      {post.metadata.duration}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {post.teacher?.name || post.student?.name || "Unknown"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(post.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post._count?.reactions || 0}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="text-xs text-gray-600">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest Media */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Latest Uploads
          </h2>
          <Link
            href="/media/latest"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All
          </Link>
        </div>

        {latestLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/media/${post.id}`}
                className="flex gap-4 p-3 bg-gray-900/50 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all group"
              >
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {post.type === "VIDEO" && (
                    <Film className="w-8 h-8 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  )}
                  {post.type === "AUDIO" && (
                    <Headphones className="w-8 h-8 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  )}
                  {post.type === "IMAGE" && (
                    <Image className="w-8 h-8 text-gray-600 group-hover:text-green-400 transition-colors" />
                  )}
                  {post.type === "PDF" && (
                    <File className="w-8 h-8 text-gray-600 group-hover:text-orange-400 transition-colors" />
                  )}
                  {post.type === "TEXT" && (
                    <Newspaper className="w-8 h-8 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {post.teacher?.name || post.student?.name || "Unknown"} •{" "}
                    {formatViews(post.views)} views
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post._count?.reactions || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post._count?.comments || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Stats Section */}
      {stats && !statsLoading && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Posts", value: stats.total.toString(), icon: Film },
            {
              label: "Published",
              value: stats.published.toString(),
              icon: Newspaper,
            },
            {
              label: "Total Views",
              value: formatViews(stats.views),
              icon: Eye,
            },
            {
              label: "Comments",
              value: stats.comments.toString(),
              icon: MessageCircle,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-gray-900/50 border border-white/10 rounded-xl p-4 text-center"
              >
                <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
