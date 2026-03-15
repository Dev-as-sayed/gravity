// src/components/media/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Video,
  Film,
  Headphones,
  Image,
  File,
  Newspaper,
  Phone,
  Atom,
  X,
  ChevronRight,
  TrendingUp,
  User,
  LogOut,
  Menu,
  Bookmark,
  Clock,
  Heart,
  Settings,
  HelpCircle,
  Sparkles,
  Rocket,
  Target,
  Zap,
  Globe,
  Award,
} from "lucide-react";

// Navigation items based on Post types
const navItems = [
  { name: "Home", href: "/media", icon: Home, endpoint: "/media" },
  {
    name: "Videos",
    href: "/media/videos",
    icon: Video,
    endpoint: "/media?type=VIDEO",
  },
  {
    name: "Lectures",
    href: "/media/lectures",
    icon: Film,
    endpoint: "/media?type=VIDEO&category=lecture",
  },
  {
    name: "Podcasts",
    href: "/media/podcasts",
    icon: Headphones,
    endpoint: "/media?type=AUDIO",
  },
  {
    name: "Images",
    href: "/media/images",
    icon: Image,
    endpoint: "/media?type=IMAGE",
  },
  {
    name: "Documents",
    href: "/media/documents",
    icon: File,
    endpoint: "/media?type=PDF",
  },
  {
    name: "Blog",
    href: "/media/blog",
    icon: Newspaper,
    endpoint: "/media?type=TEXT",
  },
  { name: "Contact", href: "/media/contact", icon: Phone },
];

// Quick filters
const quickFilters = [
  {
    name: "Featured",
    icon: Sparkles,
    filter: "isFeatured=true",
    color: "text-yellow-400",
  },
  {
    name: "Trending",
    icon: TrendingUp,
    filter: "sortBy=views&sortOrder=desc",
    color: "text-purple-400",
  },
  {
    name: "Latest",
    icon: Clock,
    filter: "sortBy=createdAt&sortOrder=desc",
    color: "text-blue-400",
  },
  {
    name: "Most Liked",
    icon: Heart,
    filter: "sortBy=reactions&sortOrder=desc",
    color: "text-red-400",
  },
];

// Popular topics (can be fetched from API)
const popularTopics = [
  { name: "Quantum Mechanics", count: 45, icon: Atom },
  { name: "Electromagnetism", count: 38, icon: Zap },
  { name: "Relativity", count: 32, icon: Globe },
  { name: "Particle Physics", count: 28, icon: Target },
  { name: "Thermodynamics", count: 24, icon: Rocket },
  { name: "Classical Mechanics", count: 22, icon: Award },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onClose}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl 
          border-r border-white/10 z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:z-30
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-white/10">
          <Atom className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Gravity Media
          </span>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-l-2 border-blue-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
                onClick={onClose}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Filters */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Filters
          </h3>
          <div className="space-y-1">
            {quickFilters.map((filter, index) => {
              const Icon = filter.icon;
              return (
                <Link
                  key={index}
                  href={`/media?${filter.filter}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={onClose}
                >
                  <Icon className={`w-4 h-4 ${filter.color}`} />
                  <span className="text-sm">{filter.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Popular Topics
          </h3>
          <div className="space-y-2">
            {popularTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={index}
                  href={`/media?topic=${topic.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      {topic.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400">
                    {topic.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="px-4 py-2">
          <Link
            href="/media/bookmarks"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={onClose}
          >
            <Bookmark className="w-5 h-5" />
            <span className="flex-1">Saved Items</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              12
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <div className="flex gap-1">
              <Link
                href="/media/settings"
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                onClick={onClose}
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/media/help"
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                onClick={onClose}
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Link>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
