"use client";

import { useUser } from "@/hooks/useUser";

const Page = () => {
  const { user, isLoading, isAuthenticated, isAdmin } = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      {isAdmin && <p>You are an Admin 🔥</p>}
    </div>
  );
};

export default Page;
