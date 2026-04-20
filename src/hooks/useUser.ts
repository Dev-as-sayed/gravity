// src/hooks/useUser.ts

"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectUserRole,
  refreshSession,
} from "@/store/slices/authSlice";

export const useUser = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const role = useAppSelector(selectUserRole);

  useEffect(() => {
    // Only fetch session if not already loaded
    if (!user && !isLoading) {
      dispatch(refreshSession());
    }
  }, [dispatch, user, isLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    role,

    // Helper flags (very useful in UI)
    isAdmin: role === "admin",
    isTeacher: role === "teacher",
    isStudent: role === "student",

    hasUser: !!user,
  };
};
