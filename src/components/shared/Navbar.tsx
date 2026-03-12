"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  BookOpen,
  Info,
  Film,
  FileText,
  StickyNote,
  Phone,
  Menu,
  X,
  Atom,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Course", href: "/course", icon: BookOpen },
  { name: "About", href: "/about", icon: Info },
  { name: "Media", href: "/media", icon: Film },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Notes", href: "/notes", icon: StickyNote },
  { name: "Contact", href: "/contact", icon: Phone },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get dashboard path based on user role
  const getDashboardPath = "/dashboard";

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Atom className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Gravity
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      flex items-center space-x-1 group
                      ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}

                    {/* Hover effect */}
                    <span className="absolute inset-0 rounded-md bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-200" />
                  </Link>
                );
              })}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="w-20 h-9 bg-muted/50 animate-pulse rounded-md" />
              ) : isAuthenticated ? (
                <>
                  {/* Dashboard Button */}
                  <Link
                    href={getDashboardPath}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {session?.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground hidden lg:block">
                        {session?.user?.name?.split(" ")[0] || "User"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href={getDashboardPath}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors lg:hidden"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // Add logout logic here
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/enroll"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Enroll Now
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 border border-primary/30 text-foreground rounded-md text-sm font-medium hover:bg-primary/5 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 relative
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && (
                  <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Conditional button based on auth status */}
          {isAuthenticated ? (
            <Link
              href={getDashboardPath}
              className="flex flex-col items-center py-2 px-3 rounded-lg text-primary hover:text-primary/80 transition-colors relative"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="flex flex-col items-center py-2 px-3 rounded-lg text-primary hover:text-primary/80 transition-colors relative"
            >
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Login</span>
            </Link>
          )}

          {/* More menu button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>
      {/* Mobile Slide-out Menu */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsOpen(false)}
        />

        {/* Menu panel */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l border-border shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* User info (if logged in) */}
          {isAuthenticated && (
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-2">
            {/* Remaining nav items */}
            {navItems.slice(4).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Dashboard link for mobile menu */}
            {isAuthenticated && (
              <Link
                href={getDashboardPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 mt-2 border-t border-border pt-4"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Login/Logout button */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Add logout logic here
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Top Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center space-x-2">
            <Atom className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Gravity</span>
          </Link>

          {/* Mobile top bar right section */}
          {isAuthenticated ? (
            <Link
              href={getDashboardPath}
              className="p-2 rounded-lg bg-primary/10 text-primary"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden block h-14" /> {/* Top spacer */}
      <div className="md:hidden block h-16" /> {/* Bottom spacer */}
    </>
  );
}
