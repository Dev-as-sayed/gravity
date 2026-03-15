// src/components/media/TopBar.tsx
"use client";

import React from "react";
import { Menu, Search, Bell, ChevronDown, X } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  isSearchOpen: boolean;
  onSearchToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TopBar = ({
  onMenuClick,
  isSearchOpen,
  onSearchToggle,
  searchQuery,
  onSearchChange,
}: TopBarProps) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Menu Button (Mobile) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={onSearchToggle}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSearchOpen ? (
              <X className="w-5 h-5 text-gray-400" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
            <span className="hidden lg:block text-sm text-white">John Doe</span>
            <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden p-4 border-t border-white/10">
          <div className="flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
