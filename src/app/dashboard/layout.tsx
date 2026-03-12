// src/components/dashboard/RootDashboardLayout.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardNav from "@/components/shared/DashboardNav";
import DashboardTopBar from "@/components/shared/DashboardTopBar";

interface RootDashboardLayoutProps {
  children: React.ReactNode;
}

const RootDashboardLayout = ({ children }: RootDashboardLayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile nav when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const handleNavToggle = () => {
    if (window.innerWidth >= 1024) {
      setIsNavCollapsed(!isNavCollapsed);
    } else {
      setIsMobileNavOpen(!isMobileNavOpen);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
          ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <DashboardNav
          isCollapsed={isNavCollapsed}
          onToggle={handleNavToggle}
          onClose={() => setIsMobileNavOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300 min-h-screen
          ${isNavCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        {/* Top Bar */}
        <DashboardTopBar
          onMenuClick={handleNavToggle}
          isNavCollapsed={isNavCollapsed}
          isMobileOpen={isMobileNavOpen}
        />

        {/* Page Content */}
        <main className="pt-16 min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RootDashboardLayout;
