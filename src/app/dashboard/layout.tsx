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

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen bg-gray-950 flex overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-all duration-300
          ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-screen overflow-hidden">
          <DashboardNav
            isCollapsed={isNavCollapsed}
            onToggle={handleNavToggle}
            onClose={() => setIsMobileNavOpen(false)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`
          flex flex-col flex-1 transition-all duration-300
          ${isNavCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        {/* Topbar */}
        <DashboardTopBar
          onMenuClick={handleNavToggle}
          isNavCollapsed={isNavCollapsed}
          isMobileOpen={isMobileNavOpen}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-16 bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RootDashboardLayout;
