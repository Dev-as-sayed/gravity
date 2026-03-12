// src/components/dashboard/DashboardNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, LogOut, X, Atom } from "lucide-react";
import { roleNavMap, NavItem } from "@/utils/dashboardNavItem";

interface DashboardNavProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const DashboardNav = ({
  isCollapsed = false,
  onToggle,
  onClose,
}: DashboardNavProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.role) {
      const items = roleNavMap[session.user.role] || [];
      setNavItems(items);
    }
  }, [session]);

  if (!mounted) return null;

  return (
    <aside
      className={`h-screen bg-gray-900 border-r border-white/10 transition-all duration-300 flex flex-col
        ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Atom className="w-8 h-8 text-blue-400 shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
              Gravity
            </span>
          )}
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + "/");

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-400" : "group-hover:text-blue-400"}`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium truncate">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-white">
                  {session?.user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex justify-center p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex items-center justify-center w-6 h-6 bg-gray-800 border border-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default DashboardNav;
