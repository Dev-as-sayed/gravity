// src/hooks/useAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export const useAuth = (redirectTo?: string) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (session?.user) {
      dispatch(setUser(session.user));
    }
  }, [session, dispatch]);

  useEffect(() => {
    if (redirectTo && status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, redirectTo, router]);

  return {
    user: user || session?.user,
    isAuthenticated: isAuthenticated || !!session?.user,
    isLoading: status === "loading",
    role: user?.role || session?.user?.role,
  };
};
