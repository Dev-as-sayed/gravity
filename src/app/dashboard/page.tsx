"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const roleRedirect: Record<string, string> = {
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  MODERATOR: "/dashboard/dashboard",
  GUARDIAN: "/guardian/dashboard",
};

const DashboardRoot = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
      return;
    }
    const target = roleRedirect[session.user.role] || "/auth/login";
    router.replace(target);
  }, [session, status, router]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default DashboardRoot;
