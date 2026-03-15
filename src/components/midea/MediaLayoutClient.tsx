// src/components/media/MediaLayoutClient.tsx
"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import RightSidebar from "./RightSidebar";

interface MediaLayoutClientProps {
  children: React.ReactNode;
}

const MediaLayoutClient = ({ children }: MediaLayoutClientProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 min-h-screen flex">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          {/* <TopBar
            onMenuClick={() => setIsSidebarOpen(true)}
            isSearchOpen={isSearchOpen}
            onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          /> */}

          {/* Page Content */}
          <div className="p-4 lg:p-6">{children}</div>
        </main>

        {/* Right Sidebar - Ads & Important Notices */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default MediaLayoutClient;
